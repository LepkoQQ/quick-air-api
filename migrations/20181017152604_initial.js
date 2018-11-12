/* eslint-disable consistent-return */
exports.up = (knex, Promise) => (
  Promise.all([
    knex.schema.hasTable('sensors').then((exists) => {
      if (!exists) {
        return knex.schema.createTable('sensors', (table) => {
          table.increments();
          table.string('sensor_id').notNullable();
          table.string('data_p1').notNullable().defaultTo('');
          table.string('data_p2').notNullable().defaultTo('');
          table.string('lat').notNullable().defaultTo('');
          table.string('lng').notNullable().defaultTo('');
        });
      }
    }),
  ])
);

exports.down = (knex, Promise) => (
  Promise.all([
    knex.schema.dropTable('sensors'),
  ])
);
