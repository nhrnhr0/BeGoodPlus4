var documentstocklist=function(){"use strict";function t(){}function e(t){return t()}function n(){return Object.create(null)}function s(t){t.forEach(e)}function o(t){return"function"==typeof t}function c(t,e){return t!=t?e==e:t!==e||t&&"object"==typeof t||"function"==typeof t}function r(t,e){t.appendChild(e)}function l(t,e,n){t.insertBefore(e,n||null)}function i(t){t.parentNode.removeChild(t)}function a(t){return document.createElement(t)}function u(t){return document.createTextNode(t)}function d(){return u(" ")}function f(t,e,n){null==n?t.removeAttribute(e):t.getAttribute(e)!==n&&t.setAttribute(e,n)}function m(t,e){e=""+e,t.wholeText!==e&&(t.data=e)}let h;function g(t){h=t}const p=[],j=[],$=[],_=[],v=Promise.resolve();let b=!1;function y(t){$.push(t)}const k=new Set;let x=0;function w(){const t=h;do{for(;x<p.length;){const t=p[x];x++,g(t),E(t.$$)}for(g(null),p.length=0,x=0;j.length;)j.pop()();for(let t=0;t<$.length;t+=1){const e=$[t];k.has(e)||(k.add(e),e())}$.length=0}while(p.length);for(;_.length;)_.pop()();b=!1,k.clear(),g(t)}function E(t){if(null!==t.fragment){t.update(),s(t.before_update);const e=t.dirty;t.dirty=[-1],t.fragment&&t.fragment.p(t.ctx,e),t.after_update.forEach(y)}}const A=new Set;function N(t,e){-1===t.$$.dirty[0]&&(p.push(t),b||(b=!0,v.then(w)),t.$$.dirty.fill(0)),t.$$.dirty[e/31|0]|=1<<e%31}function O(c,r,l,a,u,d,f,m=[-1]){const p=h;g(c);const j=c.$$={fragment:null,ctx:null,props:d,update:t,not_equal:u,bound:n(),on_mount:[],on_destroy:[],on_disconnect:[],before_update:[],after_update:[],context:new Map(r.context||(p?p.$$.context:[])),callbacks:n(),dirty:m,skip_bound:!1,root:r.target||p.$$.root};f&&f(j.root);let $=!1;if(j.ctx=l?l(c,r.props||{},((t,e,...n)=>{const s=n.length?n[0]:e;return j.ctx&&u(j.ctx[t],j.ctx[t]=s)&&(!j.skip_bound&&j.bound[t]&&j.bound[t](s),$&&N(c,t)),e})):[],j.update(),$=!0,s(j.before_update),j.fragment=!!a&&a(j.ctx),r.target){if(r.hydrate){const t=function(t){return Array.from(t.childNodes)}(r.target);j.fragment&&j.fragment.l(t),t.forEach(i)}else j.fragment&&j.fragment.c();r.intro&&((_=c.$$.fragment)&&_.i&&(A.delete(_),_.i(v))),function(t,n,c,r){const{fragment:l,on_mount:i,on_destroy:a,after_update:u}=t.$$;l&&l.m(n,c),r||y((()=>{const n=i.map(e).filter(o);a?a.push(...n):s(n),t.$$.on_mount=[]})),u.forEach(y)}(c,r.target,r.anchor,r.customElement),w()}var _,v;g(p)}function B(t,e,n){const s=t.slice();return s[1]=e[n],s}function C(t){let e,n,s,o,c,h,g,p,j,$,_,v,b,y,k,x,w,E,A,N,O,B,C,S,T,I,M,q,H=t[1].id+"",J=t[1].description+"",L=t[1].docNumber+"",P=t[1].provider_name+"",z=t[1].created_at+"",D=t[1].warehouse_name+"",F=t[1].isAplied+"";return{c(){e=a("tr"),n=a("td"),s=u(H),o=d(),c=a("td"),h=u(J),g=d(),p=a("td"),j=u(L),$=d(),_=a("td"),v=u(P),b=d(),y=a("td"),k=u(z),x=d(),w=a("td"),E=u(D),A=d(),N=a("td"),O=u(F),B=d(),C=a("td"),S=a("a"),T=u("עריכה"),q=d(),f(n,"class","svelte-s3mgjj"),f(c,"class","svelte-s3mgjj"),f(p,"class","svelte-s3mgjj"),f(_,"class","svelte-s3mgjj"),f(y,"class","svelte-s3mgjj"),f(w,"class","svelte-s3mgjj"),f(N,"class","svelte-s3mgjj"),f(S,"href",I="/inv/doc-stock-enter/"+t[1].id),f(S,"class","edit-document-link"),f(S,"data-id",M=t[1].id),f(C,"class","svelte-s3mgjj"),f(e,"class","svelte-s3mgjj")},m(t,i){l(t,e,i),r(e,n),r(n,s),r(e,o),r(e,c),r(c,h),r(e,g),r(e,p),r(p,j),r(e,$),r(e,_),r(_,v),r(e,b),r(e,y),r(y,k),r(e,x),r(e,w),r(w,E),r(e,A),r(e,N),r(N,O),r(e,B),r(e,C),r(C,S),r(S,T),r(e,q)},p(t,e){1&e&&H!==(H=t[1].id+"")&&m(s,H),1&e&&J!==(J=t[1].description+"")&&m(h,J),1&e&&L!==(L=t[1].docNumber+"")&&m(j,L),1&e&&P!==(P=t[1].provider_name+"")&&m(v,P),1&e&&z!==(z=t[1].created_at+"")&&m(k,z),1&e&&D!==(D=t[1].warehouse_name+"")&&m(E,D),1&e&&F!==(F=t[1].isAplied+"")&&m(O,F),1&e&&I!==(I="/inv/doc-stock-enter/"+t[1].id)&&f(S,"href",I),1&e&&M!==(M=t[1].id)&&f(S,"data-id",M)},d(t){t&&i(e)}}}function S(e){let n,s,o,c,u,m=e[0],h=[];for(let t=0;t<m.length;t+=1)h[t]=C(B(e,m,t));return{c(){n=a("main"),s=a("table"),o=a("thead"),o.innerHTML='<tr class="svelte-s3mgjj"><th class="svelte-s3mgjj">id</th> \n            <th class="svelte-s3mgjj">תיאור</th> \n            <th class="svelte-s3mgjj">מספר חשבונית</th> \n            <th class="svelte-s3mgjj">ספק</th> \n            <th class="svelte-s3mgjj">נוצר ב</th> \n            <th class="svelte-s3mgjj">כניסה למחסן</th> \n            <th class="svelte-s3mgjj">האם מוכל</th> \n            <th class="svelte-s3mgjj">עריכה</th></tr>',c=d(),u=a("tbody");for(let t=0;t<h.length;t+=1)h[t].c();f(s,"class","enter-documents-table svelte-s3mgjj"),f(n,"class","svelte-s3mgjj")},m(t,e){l(t,n,e),r(n,s),r(s,o),r(s,c),r(s,u);for(let t=0;t<h.length;t+=1)h[t].m(u,null)},p(t,[e]){if(1&e){let n;for(m=t[0],n=0;n<m.length;n+=1){const s=B(t,m,n);h[n]?h[n].p(s,e):(h[n]=C(s),h[n].c(),h[n].m(u,null))}for(;n<h.length;n+=1)h[n].d(1);h.length=m.length}},i:t,o:t,d(t){t&&i(n),function(t,e){for(let n=0;n<t.length;n+=1)t[n]&&t[n].d(e)}(h,t)}}}function T(t,e,n){let{doc_stock_list:s}=e;return t.$$set=t=>{"doc_stock_list"in t&&n(0,s=t.doc_stock_list)},[s]}return new class extends class{$destroy(){!function(t,e){const n=t.$$;null!==n.fragment&&(s(n.on_destroy),n.fragment&&n.fragment.d(e),n.on_destroy=n.fragment=null,n.ctx=[])}(this,1),this.$destroy=t}$on(t,e){const n=this.$$.callbacks[t]||(this.$$.callbacks[t]=[]);return n.push(e),()=>{const t=n.indexOf(e);-1!==t&&n.splice(t,1)}}$set(t){var e;this.$$set&&(e=t,0!==Object.keys(e).length)&&(this.$$.skip_bound=!0,this.$$set(t),this.$$.skip_bound=!1)}}{constructor(t){super(),O(this,t,T,S,c,{doc_stock_list:0})}}({target:document.getElementById("documentstocklist-target"),props:JSON.parse(document.getElementById("documentstocklist-props").textContent)})}();
//# sourceMappingURL=DocumentStockList.js.map
