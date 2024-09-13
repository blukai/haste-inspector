// usefule links:
// - https://rustwasm.github.io/docs/book/reference/add-wasm-support-to-crate.html
// - https://stackoverflow.com/a/65336309
// - https://docs.rs/prost-build/latest/prost_build/struct.Config.html#method.type_attribute
//   it should be possible to make prost add [wasm_bindgen] "derives".
// - https://stackoverflow.com/questions/65332927/is-it-possible-to-wasm-bindgen-public-structs-and-functions-defined-in-anothe

use haste::{
    entities,
    fieldpath::FieldPath,
    fieldvalue::FieldValue,
    flattenedserializers::FlattenedSerializer,
    parser::{NopVisitor, Parser},
};
use std::io::Cursor;
use wasm_bindgen::{prelude::wasm_bindgen, JsError, UnwrapThrowExt};

#[wasm_bindgen]
pub struct WrappedParser {
    parser: Parser<Cursor<Vec<u8>>, NopVisitor>,
}

#[wasm_bindgen(getter_with_clone)]
pub struct EntityLi {
    pub index: i32,
    pub name: String,
}

#[wasm_bindgen(getter_with_clone)]
pub struct EntityFieldLi {
    pub path: Vec<u8>,
    #[wasm_bindgen(js_name = "namedPath")]
    pub named_path: Vec<String>,
    pub value: String,
    #[wasm_bindgen(js_name = "encodedAs")]
    pub encoded_as: String,
    #[wasm_bindgen(js_name = "decodedAs")]
    pub decoded_as: String,
}

#[wasm_bindgen]
impl WrappedParser {
    #[wasm_bindgen(constructor, js_name = "fromBytes")]
    pub fn from_bytes(bytes: Vec<u8>) -> Result<WrappedParser, JsError> {
        let parser = Parser::from_reader(Cursor::new(bytes))
            .map_err(|err| JsError::new(&err.to_string()))?;
        Ok(Self { parser })
    }

    #[wasm_bindgen(js_name = "tick")]
    pub fn tick(&mut self) -> i32 {
        self.parser.tick()
    }

    #[wasm_bindgen(js_name = "totalTicks")]
    pub fn total_ticks(&mut self) -> Result<i32, JsError> {
        self.parser
            .total_ticks()
            .map_err(|err| JsError::new(&err.to_string()))
    }

    #[wasm_bindgen(js_name = "runToTick")]
    pub fn run_to_tick(&mut self, tick: i32) -> Result<(), JsError> {
        self.parser
            .run_to_tick(tick)
            .map_err(|err| JsError::new(&err.to_string()))
    }

    #[wasm_bindgen(js_name = "listEntities")]
    pub fn list_entities(&self) -> Option<Vec<EntityLi>> {
        self.parser.entities().map(|entities| {
            entities
                .iter()
                .map(|(index, entity)| EntityLi {
                    index: *index,
                    name: entity.serializer().serializer_name.str.to_string(),
                })
                .collect()
        })
    }

    #[wasm_bindgen(js_name = "listEntityFields")]
    pub fn list_entity_fields(&self, entity_index: i32) -> Option<Vec<EntityFieldLi>> {
        self.parser.entities().and_then(|entities| {
            entities.get(&entity_index).map(|entity| {
                entity
                    .iter()
                    .map(|(key, field_value)| {
                        let fp = entity
                            .get_path(key)
                            // NOTE: this should never throw because if entity
                            // was returned it means that it exists thus path
                            // exists
                            .unwrap_throw();
                        let (named_path, var_type) = get_value_info(entity.serializer(), fp);

                        EntityFieldLi {
                            path: fp.iter().cloned().collect(),
                            named_path,
                            value: field_value.to_string(),
                            encoded_as: var_type,
                            decoded_as: get_field_value_discriminant_name(field_value).to_string(),
                        }
                    })
                    .collect()
            })
        })
    }
}

fn get_value_info(serializer: &FlattenedSerializer, fp: &FieldPath) -> (Vec<String>, String) {
    let mut result = Vec::with_capacity(fp.last());

    let first_field_index = fp.get(0).unwrap_throw();
    let mut field = serializer
        .get_child(first_field_index)
        // NOTE: this may only throw if data is corrupted or something, but
        // never in normal circumbstances
        .unwrap_throw();
    result.push(field.var_name.str.to_string());

    for field_index in fp.iter().skip(1) {
        if field.is_dynamic_array() {
            field = field.get_child(0).unwrap_throw();
            result.push(field_index.to_string());
        } else {
            // TODO: consider changing type of index arg in child*?
            // funcs from usize to u8 to be consistent with an actual
            // type of data in FieldPath
            field = field.get_child(*field_index as usize).unwrap_throw();
            result.push(field.var_name.str.to_string());
        }
    }

    (result, field.var_type.str.to_string())
}

fn get_field_value_discriminant_name(field_value: &FieldValue) -> &'static str {
    match field_value {
        FieldValue::I64(_) => "I64",
        FieldValue::U64(_) => "U64",
        FieldValue::F32(_) => "F32",
        FieldValue::Bool(_) => "Bool",
        FieldValue::Vector3(_) => "Vector3",
        FieldValue::Vector2(_) => "Vector2",
        FieldValue::Vector4(_) => "Vector4",
        FieldValue::QAngle(_) => "QAngle",
        FieldValue::String(_) => "String",
    }
}

#[wasm_bindgen(js_name = "isHandleValid")]
pub fn is_handle_valid(handle: u32) -> bool {
    entities::is_handle_valid(handle)
}

#[wasm_bindgen(js_name = "handleToIndex")]
pub fn handle_to_index(handle: u32) -> usize {
    entities::handle_to_index(handle)
}
