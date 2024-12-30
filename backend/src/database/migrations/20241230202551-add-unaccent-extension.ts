import { QueryInterface, Sequelize } from 'sequelize';

module.exports = {
  up: async (queryInterface: QueryInterface, sequelize: Sequelize) => {

    await queryInterface.sequelize.query('CREATE EXTENSION IF NOT EXISTS unaccent;');
  },

  down: async (queryInterface: QueryInterface, sequelize: Sequelize) => {
   
    await queryInterface.sequelize.query('DROP EXTENSION IF EXISTS unaccent;');
  }
};
