// usefule links:
// - https://rustwasm.github.io/docs/book/reference/add-wasm-support-to-crate.html
// - https://stackoverflow.com/a/65336309
// - https://docs.rs/prost-build/latest/prost_build/struct.Config.html#method.type_attribute
//   it should be possible to make prost add [wasm_bindgen] "derives".
// - https://stackoverflow.com/questions/65332927/is-it-possible-to-wasm-bindgen-public-structs-and-functions-defined-in-anothe

use std::io::Cursor;

use haste::{
    demofile::DemoFile,
    demostream::DemoStream,
    entities::{self, Entity},
    fieldpath::FieldPath,
    fieldvalue::FieldValue,
    flattenedserializers::FlattenedSerializer,
    parser::{NopVisitor, Parser},
};
use wasm_bindgen::{prelude::wasm_bindgen, JsError, UnwrapThrowExt};

#[wasm_bindgen]
pub struct WrappedParser {
    parser: Parser<DemoFile<Cursor<Vec<u8>>>, NopVisitor>,
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

#[wasm_bindgen(getter_with_clone)]
pub struct StringTableLi {
    pub name: String,
}

#[wasm_bindgen(getter_with_clone)]
pub struct StringTableItemLi {
    pub string: Option<Vec<u8>>,
    #[wasm_bindgen(js_name = "userData")]
    pub user_data: Option<Vec<u8>>,
}

#[wasm_bindgen]
impl WrappedParser {
    #[wasm_bindgen(constructor, js_name = "fromBytes")]
    pub fn from_bytes(bytes: Vec<u8>) -> Result<WrappedParser, JsError> {
        let demo_file = DemoFile::start_reading(Cursor::new(bytes))?;
        let parser = Parser::from_stream(demo_file)?;
        Ok(Self { parser })
    }

    #[wasm_bindgen(js_name = "tick")]
    pub fn tick(&mut self) -> i32 {
        self.parser.context().tick()
    }

    #[wasm_bindgen(js_name = "totalTicks")]
    pub fn total_ticks(&mut self) -> Result<i32, JsError> {
        self.parser
            .demo_stream_mut()
            .total_ticks()
            .map_err(|err| JsError::new(&err.to_string()))
    }

    #[wasm_bindgen(js_name = "runToTick")]
    pub fn run_to_tick(&mut self, tick: i32) -> Result<(), JsError> {
        self.parser
            .run_to_tick(tick)
            .map_err(|err| JsError::new(&err.to_string()))
    }

    fn collect_entity_list<'a>(
        entities: impl Iterator<Item = (&'a i32, &'a Entity)>,
    ) -> Vec<EntityLi> {
        entities
            .map(|(index, entity)| EntityLi {
                index: *index,
                name: entity.serializer().serializer_name.str.to_string(),
            })
            .collect()
    }

    #[wasm_bindgen(js_name = "listEntities")]
    pub fn list_entities(&self) -> Option<Vec<EntityLi>> {
        self.parser
            .context()
            .entities()
            .map(|entities| Self::collect_entity_list(entities.iter()))
    }

    #[wasm_bindgen(js_name = "listBaselineEntities")]
    pub fn list_baseline_entities(&self) -> Option<Vec<EntityLi>> {
        self.parser
            .context()
            .entities()
            .map(|entities| Self::collect_entity_list(entities.iter_baselines()))
    }

    fn collect_entity_field_list(entity: &Entity) -> Vec<EntityFieldLi> {
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
    }

    #[wasm_bindgen(js_name = "listEntityFields")]
    pub fn list_entity_fields(&self, entity_index: i32) -> Option<Vec<EntityFieldLi>> {
        self.parser.context().entities().and_then(|entities| {
            entities
                .get(&entity_index)
                .map(Self::collect_entity_field_list)
        })
    }

    #[wasm_bindgen(js_name = "listBaselineEntityFields")]
    pub fn list_baseline_entity_fields(&self, entity_index: i32) -> Option<Vec<EntityFieldLi>> {
        self.parser.context().entities().and_then(|entities| {
            entities
                .get_baseline(&entity_index)
                .map(Self::collect_entity_field_list)
        })
    }

    #[wasm_bindgen(js_name = "listStringTables")]
    pub fn list_string_tables(&self) -> Option<Vec<StringTableLi>> {
        self.parser.context().string_tables().map(|string_tables| {
            string_tables
                .tables()
                .map(|string_table| StringTableLi {
                    name: string_table.name().to_string(),
                })
                .collect()
        })
    }

    #[wasm_bindgen(js_name = "listStringTableItems")]
    pub fn list_string_table_items(
        &self,
        string_table_name: String,
    ) -> Option<Vec<StringTableItemLi>> {
        self.parser
            .context()
            .string_tables()
            .and_then(|string_tables| {
                string_tables
                    .find_table(&string_table_name)
                    .map(|string_table| {
                        string_table
                            .items()
                            .map(|(_index, item)| StringTableItemLi {
                                string: item.string.clone(),
                                user_data: item
                                    .user_data
                                    .as_ref()
                                    .map(|rc| unsafe { (&*rc.get()).clone() }),
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

#[wasm_bindgen(js_name = "isEHandleValid")]
pub fn is_ehandle_valid(handle: u32) -> bool {
    entities::is_ehandle_valid(handle)
}

#[wasm_bindgen(js_name = "eHandleToIndex")]
pub fn ehandle_to_index(handle: u32) -> i32 {
    entities::ehandle_to_index(handle)
}
