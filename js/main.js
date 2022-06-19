$( document ).ready(function() {
  $.getScript( "js/lib/web_components/main_container.js", function() {
    let e = document.createElement('main-container');
    $('#main-container').append(e);
  });

});