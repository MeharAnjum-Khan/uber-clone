# DATABASE SCHEMA

Source: Phase 5 (Antigravity)

# Database Schema Design - Uber Clone

This schema is designed based on the requirements specified in "API_CONTRACT.md"

# Table Details

## 1. users table

| Column     | Type                             | Constraints               | Description   |
| :--------- | :------------------------------- | :------------------------ | :------------ |
| id         | VARCHAR(255)                     | PRIMARY KEY               | Clerk User ID |
| email      | VARCHAR(255)                     | UNIQUE, NOT NULL          |               |
| name       | VARCHAR(255)                     |                           |               |
| phone      | VARCHAR(20)                      |                           |               |
| role       | ENUM('rider', 'driver', 'admin') | DEFAULT 'rider'           |               |
| created_at | TIMESTAMP                        | DEFAULT CURRENT_TIMESTAMP |               |

## 2. drivers table

| Column          | Type                      | Constraints               | Description                                          |
| :-------------- | :------------------------ | :------------------------ | :--------------------------------------------------- |
| user_id         | VARCHAR(255)              | PRIMARY KEY, FK(users.id) | Links to user profile                                |
| status          | ENUM('online', 'offline') | DEFAULT 'offline'         |                                                      |
| vehicle_details | JSONB                     |                           | { "make": string, "model": string, "plate": string } |
| last_lat        | FLOAT                     |                           | For nearby driver tracking                           |
| last_lng        | FLOAT                     |                           | For nearby driver tracking                           |
| last_heartbeat  | TIMESTAMP                 |                           | Last time driver status was updated                  |

## 3. rides table

| Column         | Type         | Constraints            | Description                                                  |
| :------------- | :----------- | :--------------------- | :----------------------------------------------------------- |
| id             | UUID         | PRIMARY KEY            |                                                              |
| rider_id       | VARCHAR(255) | FK(users.id), NOT NULL |                                                              |
| driver_id      | VARCHAR(255) | FK(users.id)           | Initially NULL until accepted                                |
| promo_code     | VARCHAR(50)  | FK(promo_codes.code)   |                                                              |
| status         | ENUM(...)    | NOT NULL               | searching, accepted, arriving, started, completed, cancelled |
| ride_type      | VARCHAR(50)  | NOT NULL               | uber_x, uber_xl, premier                                     |
| pickup_lat     | FLOAT        | NOT NULL               |                                                              |
| pickup_lng     | FLOAT        | NOT NULL               |                                                              |
| pickup_address | TEXT         |                        |                                                              |
| drop_lat       | FLOAT        | NOT NULL               |                                                              |
| drop_lng       | FLOAT        | NOT NULL               |                                                              |
| drop_address   | TEXT         |                        |                                                              |
| distance       | FLOAT        |                        | In km/miles                                                  |
| estimated_fare | FLOAT        |                        |                                                              |
| requested_at   | TIMESTAMP    |                        |                                                              |
| accepted_at    | TIMESTAMP    |                        |                                                              |
| started_at     | TIMESTAMP    |                        |                                                              |
| completed_at   | TIMESTAMP    |                        |                                                              |

## 4. payments table

| Column     | Type         | Constraints            | Description                          |
| :--------- | :----------- | :--------------------- | :----------------------------------- |
| id         | UUID         | PRIMARY KEY            |                                      |
| ride_id    | UUID         | FK(rides.id), NOT NULL |                                      |
| user_id    | VARCHAR(255) | FK(users.id), NOT NULL | Payer (usually rider)                |
| amount     | FLOAT        | NOT NULL               |                                      |
| currency   | VARCHAR(3)   | DEFAULT 'USD'          |                                      |
| stripe_id  | VARCHAR(255) | UNIQUE                 | Stripe Payment Intent ID             |
| status     | ENUM(...)    |                        | pending, succeeded, failed, refunded |
| created_at | TIMESTAMP    |                        |                                      |

## 5. ratings table

| Column     | Type         | Constraints                         | Description |
| :--------- | :----------- | :---------------------------------- | :---------- |
| id         | UUID         | PRIMARY KEY                         |             |
| ride_id    | UUID         | FK(rides.id), NOT NULL              |             |
| rater_id   | VARCHAR(255) | FK(users.id), NOT NULL              |             |
| rated_id   | VARCHAR(255) | FK(users.id), NOT NULL              |             |
| rating     | INTEGER      | CHECK (rating >= 1 AND rating <= 5) |             |
| comment    | TEXT         |                                     |             |
| created_at | TIMESTAMP    |                                     |             |

## 6. sos_alerts

| Column       | Type      | Constraints            | Description              |
| :----------- | :-------- | :--------------------- | :----------------------- |
| id           | UUID      | PRIMARY KEY            |                          |
| ride_id      | UUID      | FK(rides.id), NOT NULL |                          |
| lat          | FLOAT     | NOT NULL               | Location at trigger time |
| lng          | FLOAT     | NOT NULL               | Location at trigger time |
| status       | ENUM(...) | DEFAULT 'notified'     | notified, resolved       |
| triggered_at | TIMESTAMP |                        |                          |

## 7. messages

| Column      | Type         | Constraints            | Description |
| :---------- | :----------- | :--------------------- | :---------- |
| id          | UUID         | PRIMARY KEY            |             |
| ride_id     | UUID         | FK(rides.id), NOT NULL |             |
| sender_id   | VARCHAR(255) | FK(users.id), NOT NULL |             |
| receiver_id | VARCHAR(255) | FK(users.id), NOT NULL |             |
| text        | TEXT         | NOT NULL               |             |
| sent_at     | TIMESTAMP    |                        |             |

## 8. promo_codes

| Column     | Type                        | Constraints  | Description |
| :--------- | :-------------------------- | :----------- | :---------- |
| code       | VARCHAR(50)                 | PRIMARY KEY  |             |
| discount   | FLOAT                       | NOT NULL     |             |
| type       | ENUM('percentage', 'fixed') |              |             |
| expires_at | TIMESTAMP                   |              |             |
| is_active  | BOOLEAN                     | DEFAULT TRUE |             |
