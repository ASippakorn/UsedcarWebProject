require('dotenv').config()

const express = require('express')
const router = express.Router()
const bodyParser = require('body-parser')
const mysql = require('mysql2')

router.use(bodyParser.json())