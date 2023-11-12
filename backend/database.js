const Pool = require('pg').Pool
const pool = new Pool({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'postgres',
    database: 'or',
})

function isIncluded(element, query, field) {
    if (field == 'wildcard') {
        return JSON.stringify(element).toLowerCase().includes(query.toLowerCase());
    } else {
        value = String(element[field]).toLowerCase();
        return value.includes(query.toLowerCase());
    }
}

const getLocations = (request, response) => {
    pool.query('SELECT locations.*, \
                maintainers.id AS maintainer_id, maintainers.name AS maintainer_name, maintainers.street AS maintainer_street, \
                maintainers.city AS maintainer_city, maintainers.province AS maintainer_province, maintainers.country AS maintainer_country \
                FROM locations \
                INNER JOIN locations_maintainers on locations.id = locations_maintainers.location_id \
                INNER JOIN maintainers ON locations_maintainers.maintainer_id = maintainers.id \
                ORDER BY locations.id', (error, result) => {
        if (error) {
            throw error
        }

        // Filter
        q = request.query.q;
        f = request.query.f;
        if (q && f) {
            response.status(200).json(result.rows.filter((el) => isIncluded(el, q, f)));
        } else {
            response.status(200).json(result.rows)
        }
    })
}

module.exports = {
    getLocations,
}  