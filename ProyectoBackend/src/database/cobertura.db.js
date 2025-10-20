
const { getConnection } = require('./database');

async function getCoberturas() {
    const connection = await getConnection();
    return connection.query("SELECT * from cobertura");
}

module.exports = { getCoberturas };