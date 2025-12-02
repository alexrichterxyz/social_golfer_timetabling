class e extends HTMLElement{#e;constructor(){super(),this.attachShadow({mode:"open"}),this.shadowRoot.innerHTML=`
            <style>
                :host {
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: 100%;
                    height: 100%;
                }

                div {
                    height: 100%;
                    width: 0%;
                    background-color: var(--md-sys-color-primary);
                    opacity: 25%;
                    transition: width 0.1s ease;
                }
            }
            </style>
            <div></div>
        `,this.#e=this.shadowRoot.querySelector("div")}set progress(e){e<0||e>=1||(this.#e.style.width=`${100*e}%`)}}customElements.define("progress-bar",e);class t extends HTMLElement{#t;#s;#r;constructor(){super(),this.attachShadow({mode:"open"}),this.shadowRoot.innerHTML=`
            <style>
            :host {
                display: inline-block;
                float: left;
            }
            input {
                all: unset;
                display: block;
                height: 32px;
                background-color: #fff;
                width: 100%;
                font-size: 18px;
                margin-top: 4px;
            }

            p {
                color: var(--md-sys-color-secondary);
            }

            </style>
            <label>
            Number of weeks
            <input type="number">
            </label>
            <p></p>
        `,this.#t=12,this.#s=this.shadowRoot.querySelector("input"),this.#s.oninput=this.#o.bind(this),this.#r=this.shadowRoot.querySelector("p"),this.#s.value=this.#t}#o(){this.#t=null;let e=parseInt(this.#s.value);if(isNaN(e)||e<2)return void this.#n("Weeks must be an integer greater than 2.");this.#t=e,this.#i()}#i(){this.#r.innerText=""}#n(e){this.#r.innerText=e}get valid(){return null!==this.#t}get numWeeks(){return this.#t}}customElements.define("week-input",t);class s extends HTMLElement{#l;#r;#a;constructor(){super(),this.attachShadow({mode:"open"}),this.shadowRoot.innerHTML=`
        <style>
            :host {
                display: inline-block;
                float: left;
            }

            input {
                all: unset;
                display: block;
                background-color: #fff;
                height: 32px;
                width: 100%;
                font-size: 18px;
                margin-top: 4px;
            }

            p {
                color: var(--md-sys-color-secondary);
            }
        </style>
        <label>
        Enter roles separated by comma
        <input type="text"/>
        <label>
        <p></p>
        `,this.#l=this.shadowRoot.querySelector("input"),this.#l.oninput=this.#u.bind(this),this.#r=this.shadowRoot.querySelector("p"),this.#a=["Leader","Scribe","Researcher"],this.#l.value=this.#a.join(", ")}#u(){let e=this.#l.value.split(",").map(e=>e.trim());this.#a=e}#i(){this.#r.innerText=""}#n(e){this.#r.innerText=e}get valid(){return null!==this.roles}get roles(){return this.#a}}customElements.define("roles-input",s);class r extends HTMLElement{#p;#h;#m;#d;#c;#g;#b;#E;#v;#y;#f;constructor(e,t){super(),this.attachShadow({mode:"open"}),this.shadowRoot.innerHTML=`
            <style>
                :host {
                    display: table-row;
                    width: 100%;
                    border-top: 1px solid #ccc;
                }

                .cell {
                    display: table-cell;
                    padding: 4px;
                }

                input {
                    all: unset;
                    width: 100%;
                    background-color: #fff;
                    text-align: right;
                    box-sizing: border-box;
                    height: 32px;
                }

                p {
                    color: var(--md-sys-color-secondary);
                }
            </style>   
            <div class="cell" id="zone"></div>
            <div class="cell" id="num-people"></div>
            <div class="cell" id="avg-per-group"></div>
            <div class="cell">
                <input id="num-groups" type="number" />
                <p id="num-groups-error"></p>
            </div>
            <div class="cell">
                <input id="num-tables" type="number" />
                <p id="num-tables-error"></p>
            </div>
        `,this.#c=this.shadowRoot.querySelector("#zone"),this.#g=this.shadowRoot.querySelector("#num-people"),this.#b=this.shadowRoot.querySelector("#avg-per-group"),this.#E=this.shadowRoot.querySelector("#num-tables"),this.#v=this.shadowRoot.querySelector("#num-groups"),this.#y=this.shadowRoot.querySelector("#num-tables-error"),this.#f=this.shadowRoot.querySelector("#num-groups-error"),this.#v.oninput=this.#w.bind(this),this.#E.oninput=this.#x.bind(this),this.#d=t,this.#m=Math.max(2,Math.ceil(this.#d/6)),this.#h=this.#m,this.#p=e,this.#c.innerText=this.#p,this.#g.innerText=this.#d,this.#b.innerText=(this.#d/this.#m).toFixed(2),this.#E.value=this.#h,this.#v.value=this.#m}#k(e){this.#y.innerText=e}#T(e){this.#y.innerText=""}#S(e){this.#f.innerText=e}#z(e){this.#f.innerText=""}#w(){this.#m=null;let e=parseInt(this.#v.value);return isNaN(e)||e<1?void this.#S("Invalid number of groups"):e>this.#h?void this.#S("Each group must have a table"):void(this.#m=e,this.#b.innerText=(this.#d/this.#m).toFixed(2),this.#z())}#x(){this.#h=null;let e=parseInt(this.#E.value);if(isNaN(e)||e<1)return void this.#k("Invalid number of tables");this.#h=e,this.#T(),this.#h>=this.#m||(this.#m=this.#h,this.#v.value=this.#m,this.#z(),this.#b.innerText=(this.#d/this.#m).toFixed(2))}get valid(){return this.#m&&this.#h}get data(){return{zone:this.#p,numGroups:this.#m,numTables:this.#h}}}customElements.define("zone-config-row",r);class o extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"}),this.shadowRoot.innerHTML=`
            <style>
                :host {
                    width: 100%;
                    display: table;
                    border-collapse: collapse;
                }

                .thead {
                    display: table-row;
                    font-weight: bold;
                    line-height: 32px;
                }

                .cell {
                    display: table-cell;
                    vertical-align: center;
                }

            </style>
            <div class="thead">
                <div class="cell">Zone</div>
                <div class="cell"># of people</div>
                <div class="cell">Avg. people per group</div>
                <div class="cell"># of groups</div>
                <div class="cell"># of tables</div>
            </div>
        `}#G(){return this.shadowRoot.querySelectorAll("zone-config-row")}reset(){this.#G().forEach(e=>e.remove())}init(e){for(let t of(this.reset(),Object.keys(e).sort())){let s=e[t].length,o=new r(t,s);this.shadowRoot.appendChild(o)}}get valid(){let e=this.#G();return e.length>0&&[...e].every(e=>e.valid)}get data(){return[...this.#G()].map(e=>e.data).reduce((e,{zone:t,...s})=>(e[t]=s,e),{})}}function n(e){let t=[],s="",r=!1;for(let o=0;o<e.length;o++){let n=e[o];'"'===n?r&&'"'===e[o+1]?(s+='"',o++):r=!r:","!==n||r?s+=n:(t.push(s),s="")}return t.push(s),t}function i(e){return e.map(e=>{let t=String(e);return t.includes('"')&&(t=t.replace(/"/g,'""')),/[",\n]/.test(t)&&(t=`"${t}"`),t}).join(",")}customElements.define("zone-config-table",o);class l extends HTMLElement{#R;#r;#P;#I;#M;constructor(){super(),this.attachShadow({mode:"open"}),this.shadowRoot.innerHTML=`
            <style>
                :host {
                    display: inline-block;
                    float: left;
                }

                div {
                    height: 48px;
                }

                span {
                    display: block;
                }

                input {
                    display: none;
                    margin-top: 4px;
                }

                #reset-button {
                    all: unset;
                    background-color: #fff;
                    width: 32px;
                    height: 32px;
                    font-size: 20px;
                    cursor: pointer;
                    line-height: 32px;
                    text-align: center;
                    color: var(--md-sys-color-primary);
                    border: 1px solid var(--md-sys-color-primary);
                    box-sizing: border-box;
                    margin-top: 4px;
                }

                #picker-button {
                    display: inline-block;
                    float: left;
                    height: 32px;
                    width: calc(100% - 32px);
                    background-color: var(--md-sys-color-primary);
                    line-height: 32px;
                    overflow: hidden;
                    white-space: nowrap;
                    text-overflow: ellipsis;
                    text-align: center;
                    cursor: pointer;
                    color: #fff;
                    margin-top: 4px;
                }

                p {
                    color: var(--md-sys-color-secondary);
                }
            }
            </style>
            <div>
                <label>
                    <span>Select a CSV</span>
                    <div id="picker-button">None selected</div>
                    <input type="file" accept=".csv" />
                </label>
                <button id="reset-button">&#10005;</button>
            </div>
            <p></p>
        `,this.#M={},this.#R=this.shadowRoot.querySelector("input"),this.#r=this.shadowRoot.querySelector("p"),this.#I=this.shadowRoot.querySelector("#reset-button"),this.#P=this.shadowRoot.querySelector("#picker-button"),this.#R.onchange=this.#q.bind(this),this.#I.onclick=this.#N.bind(this)}#N(){this.#M={},this.#P.innerText="Select a CSV file",this.#i(),this.onChanged(this.#M)}#i(){this.#r.innerText=""}#n(e){this.#r.innerText=e}#C(e){this.#M={};let t=e.target.result.trim().trim().split("\n");if(t.length<5){this.#n("CSV file must contain column names and at least 4 rows"),this.onChanged(this.#M);return}let s=t.map(n),r=s[0].map(e=>e.toLowerCase()),o=r.indexOf("name"),i=r.indexOf("zone");if(o<0){this.#n("Required column `name` is missing."),this.onChanged(this.#M);return}for(let[e,t]of s.slice(1).entries()){if(o>=t.length){this.#n(`Invalid number of values in row ${e+1}`),this.#M={},this.onChanged(this.#M);return}let s=i<t.length?t[i]:"",r=t[o];if(this.#M.hasOwnProperty(s)){if(this.#M[s].includes(r))continue;this.#M[s].push(r)}else this.#M[s]=[]}this.onChanged(this.#M)}onChanged(e){}#q(){let e=this.#R.files[0];if(!e)return void reportError("Invalid CSV file.");this.#P.innerText=e.name;let t=new FileReader;t.onload=this.#C.bind(this),t.readAsText(e)}get valid(){return Object.keys(this.#M).length>0}get data(){return this.#M}}customElements.define("csv-picker",l);const a=document.querySelector("csv-picker"),u=document.querySelector("week-input"),p=document.querySelector("roles-input"),h=document.querySelector("zone-config-table"),m=document.querySelector("progress-bar"),d=document.getElementById("compute"),c=document.getElementById("instructions");a.onChanged=e=>{if(a.valid){h.style.display="table",c.style.display="none",h.init(e);return}h.style.display="none",c.style.display="block"};var g={},b={};b=function(e,t,s){if(t===self.location.origin)return e;var r=s?"import "+JSON.stringify(e)+";":"importScripts("+JSON.stringify(e)+");";return URL.createObjectURL(new Blob([r],{type:"application/javascript"}))};let E=new URL(import.meta.resolve("kZUSq"));g=b(E.toString(),E.origin,!0),d.addEventListener("click",function(){u.valid&&p.valid&&a.valid&&h.valid||alert("Invalid inputs");let e=h.data,t=a.data,s=Object.keys(t).length,r=u.numWeeks,o=p.roles,n={},l={},d={zone:[],week:[],person:[],table:[],group:[],role:[]};for(let a in m.progress=0,e){let u=new Worker(g);u.postMessage({operation:"optimize",payload:{people:t[a],numTables:e[a].numTables,numGroups:e[a].numGroups,numWeeks:r,roles:o}}),u.onmessage=e=>{let t=e.data.operation,r=e.data.payload;switch(t){case"result":{let e=r.person.length;if(d.zone.push(...Array(e).fill(a)),d.person.push(...r.person),d.table.push(...r.table),d.week.push(...r.week),d.group.push(...r.group),d.role.push(...r.role),u.terminate(),delete n[a],Object.keys(n).length>0)break;(function(e){let t=Object.keys(e),s=e[t[0]].length,r=[t];for(let o=0;o<s;o++){let s=[];for(let r of t)s.push(e[r][o]);r.push(s)}let o=new Blob([r.map(i).join("\n")],{type:"text/csv"}),n=URL.createObjectURL(o);window.open(n,"_blank")})(d),m.progress=0;break}case"progress":l[a]=r,m.progress=Object.values(l).reduce((e,t)=>e+t)/s;break;case"log":console.log(r)}},n[a]=u}});
//# sourceMappingURL=social_golfer_timetabling.d582392d.js.map
