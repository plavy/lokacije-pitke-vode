#!/bin/bash

# Set postgres variables
export PGUSER=postgres
export PGPASSWORD=postgres
export PGDATABASE=or

# Export to CSV
psql -c "\copy (SELECT locations.id, locations.name, locations.natural_source, locations.geolocation_latitude, locations.geolocation_longitude, locations.year_of_opening, locations.currently_operational, maintainers.name AS maintainer_name, maintainers.country AS maintainer_country, maintainers.province AS maintainer_province, maintainers.city AS maintainer_city, maintainers.street AS maintainer_street FROM locations INNER JOIN maintainers ON locations.maintainer_id = maintainers.id) to '${PWD}/locations.csv' delimiter ',' csv header"

# Export to JSON
psql -At -c "SELECT JSON_AGG(tab) FROM (SELECT locations.id, locations.name, locations.natural_source, locations.geolocation_latitude, locations.geolocation_longitude, locations.year_of_opening, locations.currently_operational, JSON_BUILD_OBJECT('name', maintainers.name, 'country', maintainers.country, 'province', maintainers.province, 'city', maintainers.city, 'street', maintainers.street) AS maintainer FROM locations INNER JOIN maintainers ON locations.maintainer_id = maintainers.id GROUP BY locations.id, maintainers.id) as tab;" -o ${PWD}/locations.json

jq . locations.json
