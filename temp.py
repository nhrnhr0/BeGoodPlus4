def admin_upload_docs_page(request):
    if request.user.is_authenticated and request.user.is_superuser:
        creds = request.session.get('credentials')
        if creds:
            credsObj = Credentials(token=creds['token'], refresh_token=creds['refresh_token'], token_uri=creds['token_uri'],
                                   client_id=creds['client_id'], client_secret=creds['client_secret'], scopes=creds['scopes'])
            if credsObj.expired:
                credsObj.refresh(Request())
                request.session['credentials'] = credentials_to_dict(credsObj)
            if credsObj.valid and not credsObj.expired:
                return render(request, 'adminUploadDocs.html', context={})
        request.session['next'] = reverse('admin_upload_docs_page')
        return request_dride_auth()

    else:
        return redirect('/admin/login/?next=' + reverse('admin_upload_docs_page'))
