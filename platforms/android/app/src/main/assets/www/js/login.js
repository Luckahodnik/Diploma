$( document ).ready(function() {
    let vpis = $('#vpis');
    let form = vpis.closest('form');
    let inputs = form.find('input');
    let action = form.attr('action');
    let method = form.attr('method');
    if(!method)
        method = 'POST';

    vpis.click(function(event){
        event.preventDefault();
        let postObject = {};
        inputs.each(function( index ) {
            if($(this).attr('type') == 'file'){
                postObject[$(this).attr('id')] = $(this)[0].files[0];
            } 
            else if($(this).attr('type') == 'checkbox'){
                postObject[$(this).attr('id')] = $(this).prop('checked');
            } else {
                postObject[$(this).attr('id')] = $(this).val();
            }
        });
        var form_data = new FormData();
        for ( var key in postObject ) {
            form_data.append(key, postObject[key]);
        }
        $.ajax({
            method: method,
            url: action,
            data: form_data,
            processData: false, 
            contentType: false
        })
        .done(function( msg ) {
            alert( "Data Saved: " + msg );
        });
    });

});