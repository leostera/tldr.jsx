function! BuildJS()
  call VimuxRunCommand("time make build")
endfunction

function! BuildCSS()
  call VimuxRunCommand("time make styles")
endfunction

autocmd! BufWritePost *.js   :call BuildJS()
autocmd! BufWritePost *.sass :call BuildCSS()
