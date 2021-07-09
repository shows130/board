var express = require("express");
var router = express.Router();
var mysql = require("mysql2");
require('dotenv').config();
var Crypto = require("crypto");
var secretKey = process.env.secretKey


var connection = mysql.createConnection({


    host : process.env.host,
    port : process.env.port,
    user : process.env.user,
    password : process.env.password,
    database : process.env.database
});

router.get("/", function(req, res, next){
    if(!req.session.loged){
        res.render("login",{
            name : "none"
        })
    }else{
        res.render("/login",{
            name : req.session.loged.name
        })
    }
    
})

router.post("/login", function(req, res, next){
    var post_id = req.body.post_id;
    var password = req.body.password;
    var crypto = Crypto.createHmac('sha256', secretKey).update(password).digest('hex');
    console.log(post_id, crypto);
    connection.query(
        `select * from user_list where post_id = ? and password =?`,
        [post_id, crypto],
        function(err, result){
            if(err){
                console.log(err);
                res.send("SQL login connection Error")
            }else{
                if(result.length > 0){
                    req.session.loged = result[0];
                    console.log(req.session.loged);
                    res.redirect("/board");
                }else{
                    res.render("error2", {
                        message : "땡"
                    })
                }
            }
        }
    )
})

router.get("/signup", function(req, res, next){
    res.render("signup")
})

router.post("/signup_2", function(req, res, next){
    var post_id = req.body.post_id;
    var password = req.body.password;
    var name = req.body.name;
    var division = req.body.division;
    var linkcode = req.body.linkcode;
    var crypto = Crypto.createHmac('sha256', secretKey).update(password).digest('hex');
    console.log(crypto);
    console.log(post_id, password, name, division, linkcode);
    connection.query(
        `select * from user_list where post_id = ?`,
        [post_id],
        function(err, result){
            if(err){
                console.log(err);
                res.send("SQL connent Error")
            }else{
                if(result.length > 0){
                    res.send("이미 존재하는 아이디")
                }else{
                    connection.query(
                        `insert into user_list (post_id, password, name, 
                            division, linkcode) values (?, ?, ?, ?, ?)`,
                        [post_id, crypto, name, division, linkcode],
                        function(err2, result2){
                            if(err2){
                                console.log(err2);
                                res.send("SQL insert Error");
                            }else{
                                res.redirect("/");
                            }
                        }
                    )
                }
            }
        }
    )
})

router.get("/logout", function(req, res, next){
    req.session.destroy(function(err){
        if(err){
            console.log(err);
            res.send("session destroy Error")
        }else{
            res.redirect("/")
        }
    })
})

module.exports = router;



