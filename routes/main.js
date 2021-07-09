const { query } = require('express');
const express = require('express')
const router = express.Router();
var moment = require("moment");
var mysql = require("mysql2");
const { post } = require('./login');
require('dotenv').config();

var connection = mysql.createConnection({
    host : process.env.host,
    port : process.env.port,
    user : process.env.user,
    password : process.env.password,
    database : process.env.database
  });

  router.get("/", function(req, res, next){
      if(!req.session.loged){
          res.redirect("/")
      }else{
      
      connection.query(
          `select * from board`,
          function(err, result){
              if(err){
                  console.log(err);
                  res.send("select Error")
              }else{
                //   console.log(result);
                //   console.log(result.length);
                //   res.send(result);
                  res.render('index', {
                      content : result,
                      name : req.session.loged.name,
                  })
              }
          }
      )
      }
  })

  router.get("/add", function(req, res, next){
      if(!req.session.loged){
          res.redirect("/")
      }else{
          res.render('add',{
            name : req.session.loged.name,
          });
      }
  })

  router.post("/add_2", function(req, res, next){
      var title = req.body.title;
      var content = req.body.content;
      var img = req.body.img;
      var date = moment().format("YYYYMMDD");
      var time = moment().format("hhmmss");
      var author = req.body.author;
      console.log(title, content);

            connection.query(
              `insert into board(title, content, img, date, time, author) values (?, ?, ?, ?, ?, ?)`,
              [title, content, img, date, time, author],
              function(err, result){
                  if(err){
                      console.log(err);
                      res.send("add insert Error")
                  }else{
                      res.redirect("/board")
                }
            }
        )
        
  })

  router.get("/info", function(req, res, next){
    if(!req.session.loged){
        res.redirect("/")
    }else{
    var no = req.query.no;
    console.log(no);

        connection.query(
            `select * from board where No = ?`,
            [no],
            function(err, result){
                if(err){
                  console.log(err)
                  res.send("info select Error")
                }else{
                    connection.query(
                        `select * from comment where parent_num = ?`,
                        [no],
                        function(err2, result2){
                            if(err2){
                                console.log(err2);
                                    res.render("error",{
                                        message : "게시글 댓글 출력"
                                    })
                                }else{
                                    res.render('info', {
                                        content : result,
                                        opinion : result2,
                                        post_id :req.session.loged.post_id,
                                        name : req.session.loged.name,
                                })
                            }
                        }
                    )
                }
            }
        )
    }
      })
    
    
  router.get("/del", function(req, res, next){
    if(!req.session.loged){
        res.redirect("/")
    }else{
      var no = req.query.no;
      console.log(no);

    
        connection.query(
            `delete from board where No = ?`,
            [no],
            function(err, result){
                if(err){
                    console.log(err);
                    res.send("delete Error")
                }else{
                    res.redirect("/")
                }
            }
        )
        }  
  })

  router.get("/update", function(req, res, next){
    if(!req.session.loged){
        res.redirect("/")
    }else{
      var no = req.query.no;
      console.log(no);

    
        connection.query(
            `select * from board where No = ?`,
            [no],
            function(err, result){
                if(err){
                    console.log(err);
                    res.send("update select Error")
                }else{
                    res.render('update', {
                        content : result,
                        name : req.session.loged.name,
                    })
                }
            }
        )
    }
  })

  router.post("/update_2", function(req, res, next){
    if(!req.session.loged){
        res.redirect("/")
    }else{
      var no = req.body.no;
      var title = req.body.title;
      var content = req.body.content;
      var img = req.body.img;
      console.log(no, title, content, img);

    
        connection.query(
            `update board set title = ?, content = ?, img = ? where No = ?`,
            [title, content, img, no],
            function(err, result){
                if(err){
                    console.log(err);
                    res.send("update_2 update Error")
                }else{
                    res.redirect("/board")
                }
            }
        )
        
        }
  })


// router.get('/data_list', function(req,res,next){
//     connection.query(
//                 `select * from board`,
//                 function(err,result){
//                     if(err){
//                         console.log(err);
//                         res.send("SQL login connection Error")
//                     }else{
//                         res.render("data_list",{
//                             content : result})
//                         }
//                     }
                
//             )
    
// })

router.post("/add_comment", function(req, res, next){
    if(!req.session.loged){
        res.redirect('/')
    }else{
    var no =req.body.no;
    var comment = req.body.comment;
    var post_id = req.session.loged.post_id;
    var name = req.session.loged.name;
    var date = moment().format("YYYYMMDD");
    var time = moment().format("HHMMSS");
    console.log(no, comment, post_id, name, date, time);
    connection.query(
        `insert into comment(parent_num, opinion, post_id, name, date, time) value(?,?,?,?,?,?)`,
        [no, comment, post_id, name, date, time],
        function(err, result){
            if(err){
                console.log(err);
                res.render("error",{
                    message : "댓글 추가 실패"
                })
            }else{
                res.redirect("/board/info?no="+no);
            }
        }
    )
    }
})

router.get("/comment_del/:no/:parent_num", function(req, res, next){
    var no = req.params.no; 
    var parent_num = req.params.parent_num; 
    connection.query(
        `delete from comment where No = ?`,
        [no],
        function(err, result){
            if(err){
                console.log(err);
                res.render("error",{
                    message : "댓글 삭제 에러"
                })
            }else{
                res.redirect("/board/info?no="+parent_num);
            }
        }
    )
})

router.get("/comment_like", function(req, res, next){
    var no = req.query.no;
    var parent_num = req.query.parent_num;
    var like = parseInt(req.query.like) +1;
    console.log(no, parent_num, like);
    
    
    connection.query(
        `update comment set up = ? where No = ?`,
        [like, no],
        function(err, result){
            if(err){
                console.log(err);
                res.render("error",{
                    message : "좋아요 에러"
                })
            }else{
                res.redirect("/board/info?no="+parent_num);
            }
        }
    )
    
})

router.get("/comment_hate", function(req, res, next){
    var no = req.query.no;
    var parent_num = req.query.parent_num
    var hate = parseInt(req.query.hate) +1;
    console.log(no, parent_num, hate);

    connection.query(
        `update comment set down = ? where No =?`,
        [hate, no],
        function(err, result){
            if(err){
                console.log(err);
                res.render("error",{
                    message : "싫어요 에러"
                })
            }else{
                res.redirect("/board/info?no="+parent_num)
            }
        }
    )
})


  module.exports = router;