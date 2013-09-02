var Views = Views || {};

Views.App = Backbone.View.extend({
    events: {
    },
    initialize: function() {
        // Web APIs
        this.prnServiceAPI = local.navigator('//grimwire.net:8000'); // PRN provider
        this.prnServiceAPI = this.prnServiceAPI.follow({ rel: 'self grimwire.com/-webprn/service' }); // Verify protocol support
        this.prnStationsAPI = this.prnServiceAPI.follow({ rel: 'grimwire.com/-webprn/relays', id: 'stations' });

        // Cache selectors & fn bindings
        this.setElement($('#chatapp'), true);
    },

    render: function () {
    }
});
