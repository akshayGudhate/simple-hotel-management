# Welcome to my project... Simple Hotel Management
A small project for managing the simple hotels and the rates.


### Live App

* Base URL: https://simple-hotel-management.onrender.com
* Example usage of Live Server API: https://simple-hotel-management.onrender.com/api/v1/room-rate/list


## Features
- _Room Rate_: add, update, delete, list
- _Overridden Rate_: add, update, delete, list
- _Discount_: create, update, delete, list
- _Discounted Rate_: map, list


## Database

This project is using Postgres, and below are the db details.

Tables:

```text
1. room_rates

- room_id                       - primary key
- room_name
- default_rate
- time_stamp
```

```text
2. overridden_room_rates

- orr_id                        - primary key
- room_rate_id                  - foreign key
- overridden_rate
- stay_date
- time_stamp
- (room_rate_id, stay_date)     - unique
```

```text
3. discounts

- discount_id                   - primary key
- discount_name
- discount_type
- discount_value
- time_stamp
```

```text
4. discount_room_rates

- drr_id                        - primary key
- room_rate_id                  - foreign key
- discount_id                   - foreign key
- time_stamp
```

Indexes:

```text
1. idx_stay_date - (stay_date)
```

```text
2. idx_room_rate_discount - (room_rate_id, discount_id)
```

Views:

```text
1. view_room_rates_with_discounts

- room_id
- room_name
- final_room_rate
- fixed_discount
- percentage_discount
- effective_date
```

## Engineering Design Decisions
- For a more detailed explanation, please check  the **NOTE** section in the code file.
```js
// NOTE:
// example explanation
```

1. Added `time_stamp` in the table, so we can track or analyze based on time.
2. Created `view` to remove the redundancy of using the same join and the same information everywhere.
3. We could have used `Materialized Views` for the `rate calculations` as a caching. But we need to refresh the view periodically to maintain consistency.
4. Created index on the `overridden_room_rates` and `discount_room_rates` table for efficiently getting the `discount rate calculations` and the search by `stay_date`.
5. Using an index helped us in reading data faster, you can see the difference in the costs for the same query using `EXPLAIN ANALYSE`.

    * Query without index:
    ```sql
    -- change index settings to OFF
    SET enable_indexscan = OFF;
    SET enable_bitmapscan = OFF;
    SET enable_indexonlyscan = OFF;

    -- execute query
    EXPLAIN ANALYSE
    SELECT *
    FROM view_room_rates_with_discounts
    WHERE 
        room_id = 1 AND
        effective_date BETWEEN '2024-06-01' AND '2024-06-30';
    ```
    
    * Query Execution Explanation & Analysis:
    ```text
    -> Subquery Scan on view_room_rates_with_discounts (cost=80.77..80.83 rows=1 width=572) (actual time=0.015..0.016 rows=0 loops=1)
      -> GroupAggregate (cost=80.77..80.82 rows=1 width=608) (actual time=0.013..0.015 rows=0 loops=1)
            Group Key: rr.room_id, orr.overridden_rate, orr.stay_date
            -> Sort (cost=80.77..80.78 rows=1 width=690) (actual time=0.012..0.013 rows=0 loops=1)
                  Sort Key: orr.overridden_rate, orr.stay_date
                  Sort Method: quicksort  Memory: 25kB
                  -> Nested Loop Left Join (cost=31.35..80.76 rows=1 width=690) (actual time=0.005..0.006 rows=0 loops=1)
                        Join Filter: (rr.room_id = orr.room_rate_id)
                        Filter: ((COALESCE(orr.stay_date, CURRENT_DATE) >= '2024-06-01'::date) AND (COALESCE(orr.stay_date, CURRENT_DATE) <= '2024-06-30'::date))
                        -> Nested Loop Left Join (cost=31.35..54.75 rows=1 width=670) (actual time=0.005..0.006 rows=0 loops=1)
                              Join Filter: (rr.room_id = dr.room_rate_id)
                              -> Seq Scan on room_rates rr (cost=0.00..11.75 rows=1 width=536) (actual time=0.005..0.005 rows=0 loops=1)
                                    Filter: (room_id = 1)
                              -> Hash Right Join (cost=31.35..42.90 rows=8 width=138) (never executed)
                                    Hash Cond: (d.discount_id = dr.discount_id)
                                    -> Seq Scan on discounts d (cost=0.00..11.10 rows=110 width=138) (never executed)
                                    -> Hash (cost=31.25..31.25 rows=8 width=8) (never executed)
                                          -> Seq Scan on discount_room_rates dr (cost=0.00..31.25 rows=8 width=8) (never executed)
                                                Filter: (room_rate_id = 1)
                        -> Seq Scan on overridden_room_rates orr (cost=0.00..25.88 rows=6 width=24) (never executed)
                              Filter: (room_rate_id = 1)
    Planning Time: 0.455 ms
    Execution Time: 0.081 ms
    ```

     * Query with index:
    ```sql
    -- change index settings to ON
    SET enable_indexscan = ON;
    SET enable_bitmapscan = ON;
    SET enable_indexonlyscan = ON;

    -- execute query
    EXPLAIN ANALYSE
    SELECT *
    FROM view_room_rates_with_discounts
    WHERE 
        room_id = 1 AND
        effective_date BETWEEN '2024-06-01' AND '2024-06-30';
    ```

    * Query Execution Explanation & Analysis:
    ```text
    -> Subquery Scan on view_room_rates_with_discounts (cost=40.17..40.23 rows=1 width=572) (actual time=0.026..0.028 rows=0 loops=1)
      -> GroupAggregate (cost=40.17..40.22 rows=1 width=608) (actual time=0.025..0.026 rows=0 loops=1)
            Group Key: rr.room_id, orr.overridden_rate, orr.stay_date
            -> Sort (cost=40.17..40.18 rows=1 width=690) (actual time=0.024..0.025 rows=0 loops=1)
                  Sort Key: orr.overridden_rate, orr.stay_date
                  Sort Method: quicksort  Memory: 25kB
                  -> Nested Loop Left Join (cost=8.70..40.16 rows=1 width=690) (actual time=0.012..0.014 rows=0 loops=1)
                        -> Nested Loop Left Join (cost=8.56..36.44 rows=1 width=560) (actual time=0.012..0.013 rows=0 loops=1)
                              Join Filter: (rr.room_id = dr.room_rate_id)
                              -> Nested Loop Left Join (cost=4.34..21.96 rows=1 width=556) (actual time=0.011..0.012 rows=0 loops=1)
                                    Join Filter: (rr.room_id = orr.room_rate_id)
                                    Filter: ((COALESCE(orr.stay_date, CURRENT_DATE) >= '2024-06-01'::date) AND (COALESCE(orr.stay_date, CURRENT_DATE) <= '2024-06-30'::date))
                                    -> Index Scan using room_rates_pkey on room_rates rr (cost=0.14..8.16 rows=1 width=536) (actual time=0.011..0.011 rows=0 loops=1)
                                          Index Cond: (room_id = 1)
                                    -> Bitmap Heap Scan on overridden_room_rates orr (cost=4.20..13.67 rows=6 width=24) (never executed)
                                          Recheck Cond: (room_rate_id = 1)
                                          -> Bitmap Index Scan on unique_room_date (cost=0.00..4.20 rows=6 width=0) (never executed)
                                                Index Cond: (room_rate_id = 1)
                              -> Bitmap Heap Scan on discount_room_rates dr (cost=4.21..14.37 rows=8 width=8) (never executed)
                                    Recheck Cond: (room_rate_id = 1)
                                    -> Bitmap Index Scan on idx_room_rate_discount (cost=0.00..4.21 rows=8 width=0) (never executed)
                                          Index Cond: (room_rate_id = 1)
                        -> Index Scan using discounts_pkey on discounts d (cost=0.14..3.66 rows=1 width=138) (never executed)
                              Index Cond: (discount_id = dr.discount_id)
    Planning Time: 0.669 ms
    Execution Time: 0.184 ms
    ```

* _**Conclusion**_: The cost of the `query without index` is much higher (cost=80.77..80.83 rows=1 width=572) than the cost of the `query with index` (cost=40.17..40.23 rows=1 width=572). So, it's better to use index queries here. 


## Setup & Useful commands

The project makes use of node and its package manager to help you out carrying some common tasks such as running a project.

### Clone the repository

```console
$ git clone https://github.com/akshayGudhate/simple-hotel-management.git
```

### Create a .env file and add the below variables

```console
$ cat <<EOL > .env
PORT=8080
DATABASE_URL=postgres://<user>:<password>@<host>:<port>/<dbName>
EOL
```

### Install dependencies

```console
$ yarn
```

### Run the application

Run the application which will be listening on port `8080`. There are two ways to run the application.

- Run the application with the current code

  ```console
  $ yarn start
  ```

- Run the application with reload on save

  ```console
  $ yarn dev
  ```


## API's

Below is a list of API endpoints with their respective input and output. FYI, the application needs to be running for the following endpoints to work.
---------------------------------------------------------------------------------------------------------------------------------------

#### Add new room

Endpoint

```text
POST api/v1/room-rate
```

Example of body

```json
{
    "name": <ROOM NAME>,
    "defaultRate": <ROOM PRICE DEFAULT>
}
```

Parameters

| Parameter     | Required | Description       | Options / Examples           |
| ------------- | -------- | ----------------- | ---------------------------- |
| `name`        | Yes      | Name of the room  | `Simple`, `Deluxe`           |
| `defaultRate` | Yes      | Default room rate | Any Positive Integer - `100` |


Example of output - when the room is added successfully

`HTTP Status Code: 201`

```json
{
    "info": "New room added successfully!",
    "data": {
        "roomID": 1
    }
}
```

Example of output - on invalid default rate

`HTTP Status Code: 400`

```json
{
    "info": "Invalid room rate value, please enter a value greater than 0",
    "data": null
}
```

Example of output - on internal error

`HTTP Status Code: 500`

```json
{
    "info": "Something went wrong. An error has occurred.",
    "data": null
}
```


#### Update room rate

Endpoint

```text
PATCH api/v1/room-rate/:id
```

Example of body

```json
{
    "defaultRate": <ROOM PRICE DEFAULT>
}
```

Parameters

| Parameter     | Required | Description       | Options / Examples           |
| ------------- | -------- | ----------------- | ---------------------------- |
| `defaultRate` | Yes      | Default room rate | Any Positive Integer - `100` |


Example of output - update successfully

`HTTP Status Code: 200`

```json
{
    "info": "Room rate updated successfully!",
    "data": null
}
```

Example of output - on invalid default rate

`HTTP Status Code: 400`

```json
{
    "info": "Invalid room rate value, please enter a value greater than 0",
    "data": null
}
```

Example of output - on internal error

`HTTP Status Code: 500`

```json
{
    "info": "Something went wrong. An error has occurred.",
    "data": null
}
```


#### Delete room

Endpoint

```text
DELETE api/v1/room-rate/:id
```

Example of output - delete successful

`HTTP Status Code: 200`

```json
{
    "info": "Room deleted successfully!",
    "data": null
}
```

Example of output - on internal error

`HTTP Status Code: 500`

```json
{
    "info": "Something went wrong. An error has occurred.",
    "data": null
}
```


#### Room list

Endpoint

```text
GET api/v1/room-rate/list
```

Example of output - list fetched successfully

`HTTP Status Code: 200`

```json
{
    "info": "Room list fetched successfully!",
    "data": [
        {
            "room_id": 1,
            "room_name": "simple",
            "default_rate": "100.00",
            "time_stamp": "2024-06-26T08:31:08.118Z"
        },
        {
            "room_id": 2,
            "room_name": "deluxe",
            "default_rate": "500.00",
            "time_stamp": "2024-06-26T08:32:08.118Z"
        },
        {
            "room_id": 3,
            "room_name": "premium",
            "default_rate": "1000.00",
            "time_stamp": "2024-06-26T08:33:08.118Z"
        }
    ]
}
```

Example of output - no data

`HTTP Status Code: 404`

```json
{
    "info": "No data found!",
    "data": []
}
```

Example of output - on internal error

`HTTP Status Code: 500`

```json
{
    "info": "Something went wrong. An error has occurred.",
    "data": null
}
```
---------------------------------------------------------------------------------------------------------------------------------------

#### Add overridden room rate

Endpoint

```text
POST api/v1/overridden-rate
```

Example of body

```json
{
    "roomRateID": <ROOM RATE ID>,
    "overriddenRate": <NEW OVERRIDDEN ROOM RATE>,
    "stayDate": <DATE OF STAY>
}
```

Parameters

| Parameter        | Required | Description         | Options / Examples           |
| ---------------- | -------- | ------------------- | ---------------------------- |
| `roomRateID`     | Yes      | ID of the room      | `Simple`, `Deluxe`           |
| `overriddenRate` | Yes      | New overridden rate | Any Positive Integer - `500` |
| `stayDate`       | Yes      | Date of stay        | `2024-06-22`                 |


Example of output - when the overridden room rate is added successfully

`HTTP Status Code: 201`

```json
{
    "info": "New overridden rate added successfully!",
    "data": {
        "orrID": 1
    }
}
```

Example of output - on invalid overridden rate

`HTTP Status Code: 400`

```json
{
    "info": "Invalid room rate value, please enter a value greater than 0",
    "data": null
}
```

Example of output - already existing date entry

`HTTP Status Code: 409`

```json
{
    "info": "Key (room_rate_id, stay_date)=(5, 2024-06-22) already exists.",
    "data": null
}
```

Example of output - on internal error

`HTTP Status Code: 500`

```json
{
    "info": "Something went wrong. An error has occurred.",
    "data": null
}
```


#### Update overridden room rate

Endpoint

```text
PATCH api/v1/overridden-rate/:id
```

Example of body

```json
{
     "overriddenRate": <NEW OVERRIDDEN ROOM RATE>,
}
```

Parameters

| Parameter        | Required | Description         | Options / Examples           |
| ---------------- | -------- | ------------------- | ---------------------------- |
| `overriddenRate` | Yes      | New overridden rate | Any Positive Integer - `500` |

Example of output - update successfully

`HTTP Status Code: 200`

```json
{
    "info": "Overridden rate updated successfully!",
    "data": null
}
```

Example of output - on invalid default rate

`HTTP Status Code: 400`

```json
{
    "info": "Invalid room rate value, please enter a value greater than 0",
    "data": null
}
```

Example of output - on internal error

`HTTP Status Code: 500`

```json
{
    "info": "Something went wrong. An error has occurred.",
    "data": null
}
```


#### Delete overridden room rate

Endpoint

```text
DELETE api/v1/overridden-rate/:id
```

Example of output - delete successful

`HTTP Status Code: 200`

```json
{
    "info": "Overridden rate deleted successfully!",
    "data": null
}
```

Example of output - on internal error

`HTTP Status Code: 500`

```json
{
    "info": "Something went wrong. An error has occurred.",
    "data": null
}
```


#### Room list

Endpoint

```text
GET api/v1/overridden-rate/list
```

Example of output - list fetched successfully

`HTTP Status Code: 200`

```json
{
    "info": "Overridden rate list fetched successfully!",
    "data": [
        {
            "orr_id": 1,
            "room_rate_id": 5,
            "overridden_rate": "2200.00",
            "stay_date": "2024-06-21T18:30:00.000Z",
            "time_stamp": "2024-06-26T08:52:09.265Z"
        }
    ]
}
```

Example of output - no data

`HTTP Status Code: 404`

```json
{
    "info": "No data found!",
    "data": []
}
```

Example of output - on internal error

`HTTP Status Code: 500`

```json
{
    "info": "Something went wrong. An error has occurred.",
    "data": null
}
```
---------------------------------------------------------------------------------------------------------------------------------------

#### Create discount

Endpoint

```text
POST api/v1/discount
```

Example of body

```json
{
    "discountName": <DISCOUNT NAME>,
    "discountType": <DISCOUNT TYPE>,
    "discountValue": <DISCOUNT AMOUNT or PERCENTAGE>
}
```

Parameters

| Parameter       | Required | Description      | Options / Examples                 |
| --------------- | -------- | ---------------- | ---------------------------------- |
| `discountName`  | Yes      | Discount Name    | `P20`, `F50`                       |
| `discountType`  | Yes      | Type of discount | `fixed`, `percentage`              |
| `discountValue` | Yes      | Discount Value   | > 0 always & < 100 when percentage |

Discount Type Options

| Plan         | Description              | Discount Value                           |
| ------------ | ------------------------ | ---------------------------------------- |
| `fixed`      | Discount of fixed amount | Positive amount value                    |
| `percentage` | Discount in percentage   | Any value greater than 0 & less than 100 |


Example of output - when a new discount is created successfully

`HTTP Status Code: 201`

```json
{
    "info": "New discount created successfully!",
    "data": {
        "discountID": 1
    }
}
```

Example of output - on invalid discount type

`HTTP Status Code: 400`

```json
{
    "info": "Invalid discount type, please choose the correct one.",
    "data": null
}
```

Example of output - on invalid discount value

`HTTP Status Code: 400`

```json
{
    "info": "Invalid discount value, please enter a discount value greater than 0 for fixed and between 0 to 100 for percentage type.",
    "data": null
}
```

Example of output - on internal error

`HTTP Status Code: 500`

```json
{
    "info": "Something went wrong. An error has occurred.",
    "data": null
}
```


#### Update overridden room rate

Endpoint

```text
PATCH api/v1/discount/:id
```

Example of body

```json
{
    "discountName": <DISCOUNT NAME>,
    "discountType": <DISCOUNT TYPE>,
    "discountValue": <DISCOUNT AMOUNT or PERCENTAGE>
}
```

Parameters

| Parameter       | Required | Description      | Options / Examples                 |
| --------------- | -------- | ---------------- | ---------------------------------- |
| `discountName`  | Yes      | Discount Name    | `P20`, `F50`                       |
| `discountType`  | Yes      | Type of discount | `fixed`, `percentage`              |
| `discountValue` | Yes      | Discount Value   | > 0 always & < 100 when percentage |

Discount Type Options

| Plan         | Description              | Discount Value                           |
| ------------ | ------------------------ | ---------------------------------------- |
| `fixed`      | Discount of fixed amount | Positive amount value                    |
| `percentage` | Discount in percentage   | Any value greater than 0 & less than 100 |


Example of output - update successfully

`HTTP Status Code: 200`

```json
{
    "info": "Discount updated successfully!",
    "data": null
}
```

Example of output - on invalid discount type

`HTTP Status Code: 400`

```json
{
    "info": "Invalid discount type, please choose the correct one.",
    "data": null
}
```

Example of output - on invalid discount value

`HTTP Status Code: 400`

```json
{
    "info": "Invalid discount value, please enter a discount value greater than 0 for fixed and between 0 to 100 for percentage type.",
    "data": null
}
```

Example of output - on internal error

`HTTP Status Code: 500`

```json
{
    "info": "Something went wrong. An error has occurred.",
    "data": null
}
```


#### Delete discount

Endpoint

```text
DELETE api/v1/discount/:id
```

Example of output - delete successful

`HTTP Status Code: 200`

```json
{
    "info": "Discount deleted successfully!",
    "data": null
}
```

Example of output - on internal error

`HTTP Status Code: 500`

```json
{
    "info": "Something went wrong. An error has occurred.",
    "data": null
}
```


#### Room list

Endpoint

```text
GET api/v1/discount/list
```

Example of output - list fetched successfully

`HTTP Status Code: 200`

```json
{
    "info": "Discount list fetched successfully!",
    "data": [
        {
            "discount_id": 1,
            "discount_name": "P20",
            "discount_type": "percentage",
            "discount_value": "20.00",
            "time_stamp": "2024-06-26T09:47:17.106Z"
        },
        {
            "discount_id": 2,
            "discount_name": "F50",
            "discount_type": "fixed",
            "discount_value": "50.00",
            "time_stamp": "2024-06-26T09:51:30.403Z"
        }
    ]
}
```

Example of output - no data

`HTTP Status Code: 404`

```json
{
    "info": "No data found!",
    "data": []
}
```

Example of output - on internal error

`HTTP Status Code: 500`

```json
{
    "info": "Something went wrong. An error has occurred.",
    "data": null
}
```
---------------------------------------------------------------------------------------------------------------------------------------

#### Map discount to room rates

Endpoint

```text
POST api/v1/discounted-rate
```

Example of body

```json
{
    "roomRateID": <ROOM RATE ID i.e. ROOM ID>,
    "discountID": <DISCOUNT ID>
}
```

Parameters

| Parameter    | Required | Description | Options / Examples   |
| ------------ | -------- | ----------- | -------------------- |
| `roomRateID` | Yes      | ID of room  | SERIAL INTEGER - `1` |
| `discountID` | Yes      | Discount ID | SERIAL INTEGER - `2` |


Example of output - when a new discount is created successfully

`HTTP Status Code: 201`

```json
{
    "info": "Discount mapped to rooms successfully!",
    "data": {
        "drrID": 4
    }
}
```

Example of output - on invalid roomRateID

`HTTP Status Code: 409`

```json
{
    "info": "Key (room_rate_id)=(25) is not present in table \"room_rates\".",
    "data": null
}
```

Example of output - on invalid discountID

`HTTP Status Code: 409`

```json
{
    "info": "Key (discount_id)=(9) is not present in table \"discounts\".",
    "data": null
}
```

Example of output - on internal error

`HTTP Status Code: 500`

```json
{
    "info": "Something went wrong. An error has occurred.",
    "data": null
}
```


#### Discounted Room list with the lowest price

Endpoint

```text
GET api/v1/discounted-rate/list
```

Query Parameters

| Parameter   | Required | Description               | Options / Examples   |
| ----------- | -------- | ------------------------- | -------------------- |
| `roomID`    | Yes      | ID of room                | SERIAL INTEGER - `1` |
| `startDate` | Yes      | Date of starting for stay | `2024-06-25`         |
| `endDate`   | Yes      | Last date for stay        | `2024-06-30`         |

Example of output - list fetched successfully

`HTTP Status Code: 200`

```json
{
    "info": "Discounted room rates fetched successfully!",
    "data": [
        {
            "room_id": 3,
            "room_name": "simple",
            "final_rate_both_discount": 30,
            "final_rate_highest_discount": 50
        }
    ]
}
```

Example of output - no data

`HTTP Status Code: 404`

```json
{
    "info": "No data found!",
    "data": []
}
```

Example of output - on internal error

`HTTP Status Code: 500`

```json
{
    "info": "Something went wrong. An error has occurred.",
    "data": null
}
```
---------------------------------------------------------------------------------------------------------------------------------------


For more details check Postman Collection:
https://shrimant-peshawa-8.postman.co/workspace/NPAV-Projects~9557b0b2-2f86-495e-87a8-21bc44882372/collection/8082221-0d20322b-91c5-4a5d-b191-239a1e4903b9?action=share&creator=8082221


## TODO's
Below are some points we can consider for improving the existing system's **Reliability**and **Scalability**.

- We can add multi-tenancy here for hotels.
- Need to implement the middleware for _Authentication & Authorization_ purposes.
- Using **In-Memory Cache** can speed up the request handling transactions for the same responses.
- We can leverage **Asynchronous Architecture** for tasks like _Add Room_ and _Create Discount_ as it can afford delay.
- We can add more features like.. **Dashboard, Payments, and Notifications**.



## Thank you!! Happy Coding!!