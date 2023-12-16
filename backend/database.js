const Pool = require('pg').Pool
const pool = new Pool({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'postgres',
    database: 'or',
})

function isIncluded(element, query, field, exactMatch = false) {
    if (!field || field == 'wildcard') {
        if (exactMatch) {
            return JSON.stringify(element).toLowerCase() == query.toLowerCase();
        } else {
            return JSON.stringify(element).toLowerCase().includes(query.toLowerCase());
        }
    } else {
        value = String(element[field]).toLowerCase();
        if (exactMatch) {
            return value == query.toLowerCase();
        } else {
            return value.includes(query.toLowerCase());
        }
    }
}

// Determine max id and increase by one
async function nextId(table) {
    var result = await pool.query('SELECT id \
    FROM ' + table + ' \
    ORDER BY id DESC \
    LIMIT 1');
    return result.rows[0].id + 1;
}

async function getLocationsTable(q, f, exactMatch) {
    var result = await pool.query('SELECT locations.*, \
        maintainers.id AS maintainer_id, maintainers.name AS maintainer_name, maintainers.street AS maintainer_street, \
        maintainers.city AS maintainer_city, maintainers.province AS maintainer_province, maintainers.country AS maintainer_country \
        FROM locations \
        INNER JOIN locations_maintainers on locations.id = locations_maintainers.location_id \
        INNER JOIN maintainers ON locations_maintainers.maintainer_id = maintainers.id \
        ORDER BY locations.id');
    // Filter
    if (q) {
        var filteredRows = result.rows.filter((el) => isIncluded(el, q, f, exactMatch));
        var idSet = new Set()
        for (var row of filteredRows) {
            idSet.add(row.id)
        }
        return result.rows.filter((el) => idSet.has(el.id));
    } else {
        return result.rows;
    }
}

async function getLocations(q, f, exactMatch) {
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
        var rows = await getLocationsTable(q, f, exactMatch)
        var idSet = new Set()
        for (var row of rows) {
            idSet.add(row.id)
        }
        return result.rows[0].json_agg.filter((el) => idSet.has(el.id));
    } else {
        return result.rows[0].json_agg;
    }
}

async function getMaintainers(id) {
    if (id) {
        var result = await pool.query('SELECT JSON_AGG(tab) \
        FROM \
        (SELECT * \
            FROM maintainers \
            WHERE id = $1 \
        ) AS tab;', [id]);
        if (result.rows[0].json_agg) {
            return result.rows[0].json_agg;
        } else {
            return [];
        }
    } else {
        var result = await pool.query('SELECT JSON_AGG(tab) \
        FROM \
        (SELECT * \
            FROM maintainers \
            ) AS tab;');
        return result.rows[0].json_agg;
    }
}

async function deleteLocation(id) {
    var result1 = await pool.query('DELETE \
    FROM locations_maintainers \
    WHERE location_id = $1;',
        [id]);
    var result2 = await pool.query('DELETE \
        FROM locations \
        WHERE id = $1;',
        [id]);
}

async function createLocation(locationDto, maintainerIds) {

    // Determine id for location
    var locationId = await nextId('locations')

    // Insert location into locations
    var result1 = await pool.query('INSERT INTO locations \
    VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [locationId, locationDto.name, locationDto.natural_source, locationDto.geolocation_latitude, locationDto.geolocation_longitude,
            locationDto.geolocation_altitude, locationDto.year_of_opening])

    // Determine id for locations_maintainers relation
    var relId = await nextId('locations_maintainers');

    // Insert relations into locations_maintainers
    for (var i in maintainerIds) {
        var result2 = await pool.query('INSERT INTO locations_maintainers \
        VALUES ($1, $2, $3)',
            [relId + i, locationId, maintainerIds[i]]);
    }
    return locationId;
}

async function updateLocation(id, locationDto) {
    var result = await pool.query('UPDATE locations \
    SET (name, natural_source, geolocation_latitude, geolocation_longitude, geolocation_altitude, year_of_opening) = \
    ($1, $2, $3, $4, $5, $6) \
    WHERE id = $7',
        [locationDto.name, locationDto.natural_source, locationDto.geolocation_latitude, locationDto.geolocation_longitude,
        locationDto.geolocation_altitude, locationDto.year_of_opening, id]);
}

async function updateLocationMaintainers(locationId, maintainerIds) {
    // Delete old locations_maintainers relations
    var result1 = await pool.query('DELETE \
    FROM locations_maintainers \
    WHERE location_id = $1',
        [locationId]);

    // Determine id for locations_maintainers relation
    var relId = await nextId('locations_maintainers');

    // Insert relations into locations_maintainers
    for (var i in maintainerIds) {
        var result2 = await pool.query('INSERT INTO locations_maintainers \
    VALUES ($1, $2, $3)',
            [relId + i, locationId, maintainerIds[i]]);
    }
}

module.exports = {
    getLocationsTable,
    getLocations,
    getMaintainers,
    deleteLocation,
    createLocation,
    updateLocation,
    updateLocationMaintainers,
}  