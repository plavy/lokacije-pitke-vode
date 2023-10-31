# Locations of free drinking water

Author: Tin Plavec

Version: 1.0

Language of data: English

Keywords:
- water
- source
- geolocation

Cities covered:
- Zagreb, Croatia

## Licence

## Attributes

Data is organized in two tables.

Table `locations` has these attributes:

| Attribute | Description | PSQL Datatype | Required |
| --- | --- | --- | --- |
| id | ID of the water location | integer | yes (PK) |
| name | Name of the water location | varchar(100) | no |
| natural_source | If water is from natural source or water system | boolean | yes |
| geolocation_latitude | Latitude of the water location | numeric(9, 6) | yes |
| geolocation_longitude | Longitude of the water location | numeric(9, 6) | yes |
| geolocation_altitude | Altitude of the water location | numeric(6, 2) | yes |
| maintainer_id | ID of the responsible maintainer for the water location | integer | yes (FK) |
| year_of_opening | Year when the water location was put into operation | integer | no |

Table `maintainers` has these attributes:

| Attribute | Description | PSQL Datatype | Required |
| --- | --- | --- | --- |
| id | ID of the maintainer | integer | yes (PK) |
| name | Name of the maintainer | varchar(100) | yes |
| street | Street address of the maintainer | varchar(100) | yes |
| city | City of the maintainer | varchar(100) | yes |
| province | Province or region of the maintainer | varchar(100) | yes |
| country | Country of the maintainer | varchar(100) | yes |
