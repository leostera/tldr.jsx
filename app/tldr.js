var Vue = require("yyx990803/vue");
var request = require("visionmedia/superagent");
var marked = require("chjj/marked");
var Batch = require("visionmedia/batch");

var base_url = "https://api.github.com/repos/tldr-pages/tldr/contents/pages";

var tldr = new Vue({
    el: '#tldr',

    data: {
        query: '',
        pages: null, 
        loading: false,
        notFound: false
    },

    filters: {
        marked: function (page) {
            return page && marked(page);
        }
    },

    methods: {
        getRawPage: function(query) {
            var batch = new Batch;
            ["osx", "linux", "windows", "common"].forEach(function (os) {
                var url = [base_url, os, query+".md"].join('/');
                batch.push(function (done) {
                    request.get(url).end(function (res) {
                        if(res.status == 200) { 
                            done({os: os, page: atob(res.body.content)});
                        } else {
                            done(null);
                        }
                    });
                });
            });
            return batch;
        },

        lookUp: function () {
            if(!this.query) return; 
            this.loading = true;
            this.notFound = false;

            this.getRawPage(this.query).end(function (pages) {
                if(!pages) this.notFound = true;
                if(pages) this.pages = [pages];
                this.loading = false;
            }.bind(this));
        }
    }
});
