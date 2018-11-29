var app = {
    "api": "http://localhost/crm/public/api/customers",
    "token": null
};

app.model = Backbone.Model.extend({
    "urlRoot": app.api,
    "defaults": {
        "name": "n/a",
        "email": "n/a",
        "phone": "n/a",
        "address": "n/a"
    }
});

app.collection = Backbone.Collection.extend({
    "url": app.api,
    "model": app.model
});

var list = new app.collection();

app.view = Backbone.View.extend({
    "tagName": "tr",
    "events": {
        "click .del": "delete"
    },
    "template": _.template( $("#customer-template").html() ),
    "render": function() {
        this.$el.html( this.template( this.model.toJSON() ) );
        return this;
    },
    "delete": function() {
        list.remove(this.model);
        this.model.destroy({
            "headers": {
                "token": app.token
            }
        });
    }
});

app.main = Backbone.View.extend({
    "el": "body",
    "events": {
        "click #add": "addCustomer",
        "click #login-submit": "login"
    },
    "initialize": function() {
        app.token = localStorage.getItem('token') || null;
        var self = this;
        this.listenTo(list, "update", this.render);
        list.fetch({
            "success": function() {
                self.render();
            },
            "headers": {
                "token": app.token
            }
        });

        if(app.token) {
            $("#customers").show();
            $("#login").hide();
        } else {
            $("#customers").hide();
            $("#login").show();
        }
    },
    "render": function() {
        $("tbody").html("");
        list.each(function(customer) {
            var view = new app.view({ "model": customer });
            $("tbody").append( view.render().el );
        });
    },
    "addCustomer": function() {
        var customer = new app.model();

        customer.save({
            "name": $("#name").val(),
            "email": $("#email").val(),
            "phone": $("#phone").val(),
            "address": $("#address").val()
        }, {
            "success": function() {
                list.add(customer);
            },
            "headers": {
                "token": app.token
            }
        });

        $("#name, #email, #phone, #address").val("");
        $("#new").modal('hide');
    },
    "login": function() {
        var email = $("#login-email").val();
        var password = $("#login-password").val();
        $.post(app.api + '/login', { email: email, password: password }, function(user) {
            app.token = user.token;
            localStorage.setItem('token', app.token);
            list.fetch({
                "headers": {
                    "token": app.token
                }
            });

            $("#customers").show();
            $("#login").hide();
        }, "json");
    }
});

// $.ajaxSetup({
//     "headers": {
//         "key": "abcdef"
//     }
// });

new app.main();
