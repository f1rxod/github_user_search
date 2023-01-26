const express = require('express')
const bp = require('body-parser')
const app = express()
const https = require('https')

app.set("view engine", "ejs")
app.use(express.static('public'))
app.use(bp.urlencoded({extended:true}))

app.listen(process.env.PORT || 3000, function(){
    console.log('On it ...')
})

app.get('/', function(req,res){
    res.render('index', {
        src:'ex.png',
        name:'The Octocat',
        link:'octocat',
        _link:'@octocat',
        created:'Joined 25 January 2011',
        bio:'This profile has no bio',
        repos:'8',
        followers:'3938',
        followings:'9',
        location:'San Fracisco',
        blog:'https://github.blog',
        twitter:'Not Available',
        company:'@github'
    })
})
app.post('/', function(req,res){
    var username = req.body.name_user
    var options = {
        host: 'api.github.com',
        path: 'https://api.github.com/users/' + username,
        method: 'GET',
        headers: {'user-agent': 'node.js'}
    };
    var options_time = {
        year: 'numeric', 
        month: 'long', 
        day: 'numeric'
    }
    var options_repos = {
        host: 'api.github.com',
        path: 'https://api.github.com/users/' + username + '/repos',
        method: 'GET',
        headers: {'user-agent': 'node.js'}
    }
    var options_followers = {
        host: 'api.github.com',
        path: 'https://api.github.com/users/' + username + '/followers',
        method: 'GET',
        headers: {'user-agent': 'node.js'}
    }
    var options_folllowing = {
        host: 'api.github.com',
        path: 'https://api.github.com/users/' + username + '/following',
        method: 'GET',
        headers: {'user-agent': 'node.js'}
    }
    var _bio;
    var twitter;
    var blog;
    var place;
    var company;
    https.get(options, function(response) {
        const data = [];
        const folowers =[]
        const repos = []
        const followings = []
        response.on("data", (d) => {
            data.push(d);
        }).on('end', function() {
            const buffer = Buffer.concat(data);
            const obj = JSON.parse(buffer.toString());
            console.log(String(obj));
            var today = new Date(obj.created_at)
            if(obj.bio === null){
                _bio = "This profile has no bio"
            } else{
                _bio = obj.bio
            }
            if(obj.twitter_username === null){
                twitter = 'Not Available'
            } else{
                twitter = obj.twitter_username
            }
            if(obj.blog === '' || obj.blog === null){
                blog = 'Not Available'
            } else{
                blog = obj.blog
            }
            if(obj.location === '' || obj.location === null){
                place = 'Not Available'
            } else{
                place = obj.location
            }
            if(obj.company === '' || obj.company === null){
                company = 'Not Available'
            } else{
                company = obj.company
            }
            https.get(options_repos, function(r){
                r.on('data', (r) => {
                    repos.push(r)
                }).on('end', function(){
                    const buffer_repos = Buffer.concat(repos)
                    const object_repos = JSON.parse(buffer_repos.toString())
                    console.log(object_repos.length)
                    https.get(options_followers, function(followers){
                        followers.on('data', (f)=>{
                            folowers.push(f)
                        }).on('end', function(){
                            const buffer_followers = Buffer.concat(folowers)
                            const object_followers = JSON.parse(buffer_followers.toString())
                            console.log(object_followers.length)
                            https.get(options_folllowing, function(following){
                                following.on('data', (ff) => {
                                    followings.push(ff)
                                }).on('end', function(){
                                    const buffer_following = Buffer.concat(followings)
                                    const object_following = JSON.parse(buffer_following.toString())
                                    console.log(object_following.length)
                                    res.render('index', {
                                        src:String(obj.avatar_url),
                                        name:String(obj.login),
                                        _link:"@" + String(obj.login),
                                        link:String(obj.login),
                                        created:'Joined ' + today.toLocaleString('en-US', options_time),
                                        bio:_bio,
                                        repos:object_repos.length,
                                        followers:object_followers.length,
                                        followings:object_following.length,
                                        location:place,
                                        twitter:twitter,
                                        blog:blog,
                                        company:company
                                    })
                                })
                            })
                        })
                    })
                })
            })
        });
    })
})