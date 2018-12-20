// eslint-disable-next-line no-unused-vars
exports.up = async (knex, Promise) => {
  await knex.schema.alterTable('measurements', (table) => {
    table
      .string('data_temperature')
      .notNullable()
      .defaultTo('');
    table
      .string('data_humidity')
      .notNullable()
      .defaultTo('');
  });
};

// eslint-disable-next-line no-unused-vars
exports.down = async (knex, Promise) => {
  await knex.schema.alterTable('measurements', (table) => {
    table.dropColumn('data_temperature');
    table.dropColumn('data_humidity');
  });
};
