// eslint-disable-next-line no-unused-vars
exports.up = async (knex, Promise) => {
  await knex.schema.createTable('measurements', (table) => {
    table.increments();
    table.timestamp('timestamp').defaultTo(knex.fn.now());
    table.integer('sensor_id').notNullable();
    table
      .string('data_p1')
      .notNullable()
      .defaultTo('');
    table
      .string('data_p2')
      .notNullable()
      .defaultTo('');
    table.float('lat', 9, 6).notNullable();
    table.float('lng', 9, 6).notNullable();
  });
  await knex.schema.createTable('current_locations', (table) => {
    table
      .integer('sensor_id')
      .unique()
      .notNullable()
      .primary();
    table.float('lat', 9, 6).notNullable();
    table.float('lng', 9, 6).notNullable();
  });
  await knex.schema.renameTable('sensors', 'sensors_old');
};

// eslint-disable-next-line no-unused-vars
exports.down = async (knex, Promise) => {
  await knex.schema.renameTable('sensors_old', 'sensors');
  await knex.schema.dropTable('current_locations');
  await knex.schema.dropTable('measurements');
};
