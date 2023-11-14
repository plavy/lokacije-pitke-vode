const Pool = require('pg').Pool
const pool = new Pool({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'postgres',
    database: 'or',
})

function isIncluded(element, query, field) {
    if (!field || field == 'wildcard') {
        return JSON.stringify(element).toLowerCase().includes(query.toLowerCase());
    } else {
        value = String(element[field]).toLowerCase();
        return value.includes(query.toLowerCase());
    }
}

async function getTable(q, f) {
    var result = await pool.query('SELECT locations.*, \
        maintainers.id AS maintainer_id, maintainers.name AS maintainer_name, maintainers.street AS maintainer_street, \
        maintainers.city AS maintainer_city, maintainers.province AS maintainer_province, maintainers.country AS maintainer_country \
        FROM locations \
        INNER JOIN locations_maintainers on locations.id = locations_maintainers.location_id \
        INNER JOIN maintainers ON locations_maintainers.maintainer_id = maintainers.id \
        ORDER BY locations.id');
    // Filter
    if (q) {
        var filteredRows = result.rows.filter((el) => isIncluded(el, q, f));
        var idSet = new Set()
        for(var row of filteredRows) {
            idSet.add(row.id)
        }
        return result.rows.filter((el) => idSet.has(el.id));
    } else {
        return result.rows;
    }
}

async function getJson(q, f) {
    var result = await pool.query('SELECT JSON_AGG(tab) \
        FROM \
        (SELECT locations.*, JSON_AGG(maintainers.*) AS maintainers \
            FROM locations \
            INNER JOIN locations_maintainers on locations.id = locations_maintainers.location_id \
            INNER JOIN maintainers ON locations_maintainers.maintainer_id = maintainers.id \
            GROUP BY locations.id \
            ORDER BY locations.id \
        ) AS tab;');
    // Filter
    if (q) {
        var rows = await getTable(q, f)
        var idSet = new Set()
        for(var row of rows) {
            idSet.add(row.id)
        }
        return result.rows[0].json_agg.filter((el) => idSet.has(el.id));
    } else {
        return result.rows[0].json_agg;
    }
}

module.exports = {
    getTable,
    getJson,
}  