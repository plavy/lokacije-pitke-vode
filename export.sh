#!/bin/bash

# Set postgres variables
export PGUSER=postgres
export PGPASSWORD=postgres
export PGDATABASE=or

# Dump database
pg_dump --clean > dump.sql

# Export to JSON
psql -At -c "
SELECT JSON_AGG(tab)
FROM
  (SELECT locations.*,
    JSON_AGG(maintainers.*) AS maintainers
    FROM locations
    INNER JOIN locations_maintainers on locations.id = locations_maintainers.location_id
    INNER JOIN maintainers ON locations_maintainers.maintainer_id = maintainers.id
    GROUP BY locations.id
  ) AS tab;
" -o ${PWD}/locations.json

jq . locations.json

exit 0

# Export to CSV
psql -c "\copy (SELECT locations.id, locations.name, locations.natural_source, locations.geolocation_latitude, locations.geolocation_longitude, locations.geolocation_altitude, locations.year_of_opening, maintainers.name AS maintainer_name, maintainers.street AS maintainer_street, maintainers.city AS maintainer_city, maintainers.province AS maintainer_province, maintainers.country AS maintainer_country FROM locations INNER JOIN maintainers ON locations.maintainer_id = maintainers.id) to '${PWD}/locations.csv' delimiter ',' csv header"
