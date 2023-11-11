# Locations of free drinking water

Author: Tin Plavec

Version: 2.0

Language of data: English

Keywords:
- water
- source
- geolocation

Cities covered:
- Zagreb, Croatia

## Short description

This open dataset lists locations where drinking water is available for free.
For every water location a precise geolocation is specified, as well as the responsible maintainer.

NOTE: Water locations listed here should be, but are not guaranteed to be working. Please check with the maintainer.

## Licence

Under licence: [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/deed.en)

You are free to share and adapt.
You must give appropriate credit.
If you remix, transform, or build upon the material, you must distribute your contributions under the same license as the original.

## Attributes

Data is organized in two tables and one additional table that defines relations.

Table `locations` has these attributes:

| Attribute | Description | PSQL Datatype | Required |
| --- | --- | --- | --- |
| id | ID of the water location | integer | yes (PK) |
| name | Name of the water location | varchar(100) | no |
| natural_source | If water is from natural source or water system | boolean | yes |
| geolocation_latitude | Latitude of the water location | numeric(9, 6) | yes |
| geolocation_longitude | Longitude of the water location | numeric(9, 6) | yes |
| geolocation_altitude | Altitude of the water location | numeric(6, 2) | yes |
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

Finally, table `locations_maintainers` defines relations between the two tables, with attributes:

| Attribute | Description | PSQL Datatype | Required |
| --- | --- | --- | --- |
| id | ID of the relation | integer | yes (PK) |
| location_id | ID of the location | integer | yes (FK) |
| maintainer_id | ID of the responsible maintainer | integer | yes (FK) |
