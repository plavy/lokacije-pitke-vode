#!/bin/bash

# Set postgres variables
export PGUSER=postgres
export PGPASSWORD=postgres
export PGDATABASE=or

# Dump database
pg_dump --clean > dump.sql

# Export to CSV
psql -c "\copy
  (SELECT locations.*,
    maintainers.*
		FROM locations
    INNER JOIN locations_maintainers on locations.id = locations_maintainers.location_id
    INNER JOIN maintainers ON locations_maintainers.maintainer_id = maintainers.id
    ORDER BY locations.id
  )
TO '${PWD}/locations.csv' DELIMITER ',' CSV HEADER"

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
    ORDER BY locations.id
  ) AS tab;
" -o ${PWD}/locations.json

jq . locations.json
