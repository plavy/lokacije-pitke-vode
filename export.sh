#!/bin/bash

# Set postgres variables
export PGUSER=postgres
export PGPASSWORD=postgres
export PGDATABASE=or

# Export to CSV
psql -c "\copy (SELECT locations.id, locations.name, locations.natural_source, locations.geolocation_latitude, locations.geolocation_longitude, locations.geolocation_altitude, locations.year_of_opening, maintainers.name AS maintainer_name, maintainers.street AS maintainer_street, maintainers.city AS maintainer_city, maintainers.province AS maintainer_province, maintainers.country AS maintainer_country FROM locations INNER JOIN maintainers ON locations.maintainer_id = maintainers.id) to '${PWD}/locations.csv' delimiter ',' csv header"

# Export to JSON
psql -AtX -c "SELECT JSON_AGG(tab) FROM (SELECT locations.id, locations.name, locations.natural_source, locations.geolocation_latitude, locations.geolocation_longitude, locations.geolocation_altitude, locations.year_of_opening, JSON_BUILD_OBJECT('name', maintainers.name, 'street', maintainers.street, 'city', maintainers.city, 'province', maintainers.province, 'country', maintainers.country) AS maintainer FROM locations INNER JOIN maintainers ON locations.maintainer_id = maintainers.id GROUP BY locations.id, maintainers.id) as tab;" -o ${PWD}/locations.json

jq . locations.json

pg_dump --clean > dump.sql
