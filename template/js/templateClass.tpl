function {Template}Class(){return this.init()};
{Template}Class.prototype = {
    init: function(){
        this.s = sakura.movieClip(new {Template}.{TemplateMethod}());
        this.controller();
        return this.s;
    },
    controller: function(){
        var s = this.s;
    }
};