import{s as i}from"./services-CdXttHtG.js";const _={currentSchoolId:null,currentUserId:null,setUserContext(t,r){this.currentUserId=t,this.currentSchoolId=r,console.log("Contexte utilisateur defini: User="+t+", School="+r)},ensureContext(){if(!this.currentUserId||!this.currentSchoolId)throw new Error("Contexte utilisateur non defini")},async getDashboardMetrics(t=null){try{this.ensureContext();const r=t||this.currentSchoolId;console.log("Recuperation des metriques pour l'ecole: "+r);const[e,n,l]=await Promise.allSettled([i.from("students").select("id",{count:"exact"}).eq("school_id",r).eq("is_active",!0),i.from("teachers").select("id",{count:"exact"}).eq("school_id",r).eq("is_active",!0),i.from("classes").select("id",{count:"exact"}).eq("school_id",r)]);let o=0,s=0,a=0;e.status==="fulfilled"&&!e.value.error?o=e.value.count||0:e.status==="fulfilled"&&e.value.error&&console.warn("⚠️ Erreur students:",e.value.error.message),n.status==="fulfilled"&&!n.value.error?s=n.value.count||0:n.status==="fulfilled"&&n.value.error&&console.warn("⚠️ Erreur teachers:",n.value.error.message),l.status==="fulfilled"&&!l.value.error?a=l.value.count||0:l.status==="fulfilled"&&l.value.error&&console.warn("⚠️ Erreur classes:",l.value.error.message);const c=[{title:"Eleves",value:o,icon:"Users",trend:null},{title:"Presence Moyenne",value:0,unit:"%",icon:"Calendar",trend:null},{title:"Moyenne Generale",value:0,unit:"/20",icon:"BookOpen",trend:null},{title:"Recettes",value:0,unit:"FCFA",icon:"DollarSign",trend:null}];return console.log("Metriques recuperees:",c),{data:c,error:null}}catch(r){return console.error("Erreur recuperation metriques:",r),{data:[{title:"Eleves",value:0,icon:"Users",trend:null},{title:"Presence Moyenne",value:0,unit:"%",icon:"Calendar",trend:null},{title:"Moyenne Generale",value:0,unit:"/20",icon:"BookOpen",trend:null},{title:"Recettes",value:0,unit:"FCFA",icon:"DollarSign",trend:null}],error:null}}},async getClassAverages(){try{return this.ensureContext(),{data:[],error:null}}catch(t){return{data:[],error:t}}},async getAttendanceData(){try{return this.ensureContext(),{data:[],error:null}}catch(t){return{data:[],error:t}}},async getPaymentData(){try{return this.ensureContext(),{data:[],error:null}}catch(t){return{data:[],error:t}}},async getPersonnel(){try{this.ensureContext();const t=this.currentSchoolId;console.log("🔍 Récupération du personnel pour l'école:",t);const{data:r,error:e}=await i.from("teachers").select(`
          id,
          user_id,
          first_name,
          last_name,
          specialty,
          hire_date,
          is_active,
          school_id,
          users:user_id (
            id,
            email,
            phone,
            full_name
          )
        `).eq("school_id",t);e&&console.error("Erreur récupération enseignants:",e);const{data:n,error:l}=await i.from("secretaries").select(`
          id,
          user_id,
          first_name,
          last_name,
          hire_date,
          is_active,
          school_id,
          users:user_id (
            id,
            email,
            phone,
            full_name
          )
        `).eq("school_id",t);l&&console.error("Erreur récupération secrétaires:",l);const o=[];return r&&r.length>0&&r.forEach(s=>{var c,u,d;const a=s.hire_date?Math.floor((new Date-new Date(s.hire_date))/31536e6):0;o.push({id:s.id,name:((c=s.users)==null?void 0:c.full_name)||`${s.first_name} ${s.last_name}`,email:((u=s.users)==null?void 0:u.email)||"Non renseigné",phone:((d=s.users)==null?void 0:d.phone)||"Non renseigné",subject:s.specialty||"Non spécifié",type:"teacher",status:s.is_active?"active":"inactive",experience:`${a} an${a>1?"s":""}`,hireDate:s.hire_date,evaluation:4.5})}),n&&n.length>0&&n.forEach(s=>{var c,u,d;const a=s.hire_date?Math.floor((new Date-new Date(s.hire_date))/31536e6):0;o.push({id:s.id,name:((c=s.users)==null?void 0:c.full_name)||`${s.first_name} ${s.last_name}`,email:((u=s.users)==null?void 0:u.email)||"Non renseigné",phone:((d=s.users)==null?void 0:d.phone)||"Non renseigné",role:"Secrétaire",type:"secretary",status:s.is_active?"active":"inactive",experience:`${a} an${a>1?"s":""}`,hireDate:s.hire_date,permissions:["student_management","document_management"]})}),console.log("✅ Personnel récupéré:",o.length,"membres"),console.log("  - Enseignants:",o.filter(s=>s.type==="teacher").length),console.log("  - Secrétaires:",o.filter(s=>s.type==="secretary").length),{data:o,error:null}}catch(t){return console.error("❌ Erreur récupération personnel:",t),{data:[],error:t}}},async getStudents(){try{return this.ensureContext(),{data:[],error:null}}catch(t){return{data:[],error:t}}},async getSchoolStats(){try{this.ensureContext(),console.log("📊 Récupération des statistiques de l'école:",this.currentSchoolId);const[t,r,e]=await Promise.all([i.from("students").select("id",{count:"exact"}).eq("school_id",this.currentSchoolId).eq("is_active",!0),i.from("teachers").select("id",{count:"exact"}).eq("school_id",this.currentSchoolId).eq("is_active",!0),i.from("classes").select("id",{count:"exact"}).eq("school_id",this.currentSchoolId)]),n=t.count||0,l=r.count||0,o=e.count||0;return console.log("✅ Statistiques récupérées:",{totalStudents:n,totalTeachers:l,totalClasses:o}),{data:{totalStudents:n,totalTeachers:l,classes:o,totalRevenue:0},error:null}}catch(t){return console.error("❌ Erreur lors de la récupération des statistiques:",t),{data:{totalStudents:0,totalTeachers:0,classes:0,totalRevenue:0},error:t}}},async getSchoolDetails(t=null,r=null){var e;try{if(t){console.log("Recuperation des details de l'ecole par ID: "+t);const{data:s,error:a}=await i.from("schools").select("*, users!director_user_id (id, full_name, email)").eq("id",t).single();return a?(console.error("Erreur recuperation ecole par ID:",a),{data:null,error:a}):(console.log("Details ecole recuperes par ID:",s),{data:s,error:null})}if(r){console.log("Recherche ecole par directeur: "+r);const{data:s,error:a}=await i.from("schools").select("*, users!director_user_id (id, full_name, email)").eq("director_user_id",r).single();return a?(console.error("Erreur recherche ecole par directeur:",a),(a.code==="403"||(e=a.message)!=null&&e.includes("403"))&&console.warn("⚠️ Erreur 403 (permissions) lors de la recherche école - continuer sans données"),{data:null,error:a}):(console.log("Ecole trouvee par directeur:",s),{data:s,error:null})}this.ensureContext();const n=this.currentSchoolId;console.log("Recuperation des details de l'ecole (contexte): "+n);const{data:l,error:o}=await i.from("schools").select("*, users!director_user_id (id, full_name, email)").eq("id",n).single();return o?(console.error("Erreur recuperation ecole (contexte):",o),{data:null,error:o}):(console.log("Details ecole recuperes (contexte):",l),{data:l,error:null})}catch(n){return console.error("Erreur recuperation details ecole:",n),{data:null,error:n}}},async getClasses(t=null){try{this.ensureContext();const r=t||this.currentSchoolId;console.log("Recuperation des classes pour l'ecole: "+r);const{data:e,error:n}=await i.from("schools").select("available_classes, type").eq("id",r).single();if(n)throw console.error("Erreur recuperation ecole pour classes:",n),n;const o=(e.available_classes||[]).map((s,a)=>({id:`class_${a}`,name:s,level:s.replace(/[^0-9]/g,"")||s,section:s.replace(/[0-9]/g,"").replace("ème","").trim()||null,capacity:30,is_active:!0,created_at:new Date().toISOString()}));return console.log("Classes recuperees depuis available_classes:",o),{data:o,error:null}}catch(r){return console.error("Erreur recuperation classes:",r),{data:[],error:r}}},async getEnrollmentRequests(t=null,r={}){try{this.ensureContext();const e=t||this.currentSchoolId;console.log("🔍 Récupération des demandes d'inscription pour l'école:",e);let n=i.from("enrollment_requests").select(`
          id,
          school_id,
          academic_year_id,
          request_type,
          student_id,
          student_first_name,
          student_last_name,
          student_date_of_birth,
          student_gender,
          parent_name,
          parent_phone,
          parent_email,
          parent_address,
          current_class,
          requested_class,
          reason,
          teacher_recommendation,
          previous_school,
          documents,
          status,
          priority,
          submitted_by,
          submitted_date,
          reviewed_by,
          reviewed_date,
          validation_notes,
          created_at,
          updated_at,
          submitted_by_user:submitted_by(full_name, email),
          reviewed_by_user:reviewed_by(full_name, email),
          student:students(first_name, last_name, date_of_birth)
        `).eq("school_id",e).order("submitted_date",{ascending:!1});r.status&&(n=n.eq("status",r.status)),r.priority&&(n=n.eq("priority",r.priority)),r.request_type&&(n=n.eq("request_type",r.request_type));const{data:l,error:o}=await n;if(o)throw o;return console.log(`✅ ${(l==null?void 0:l.length)||0} demandes d'inscription récupérées`),{data:l||[],error:null}}catch(e){return console.error("❌ Erreur récupération demandes d'inscription:",e),{data:[],error:e}}},async getEnrollmentStats(t=null){try{this.ensureContext();const r=t||this.currentSchoolId,{data:e,error:n}=await i.from("enrollment_requests").select("status, priority, request_type").eq("school_id",r);if(n)throw n;return{data:{totalDemandes:(e==null?void 0:e.length)||0,enAttente:(e==null?void 0:e.filter(o=>o.status==="en_attente").length)||0,enRevision:(e==null?void 0:e.filter(o=>o.status==="en_revision").length)||0,approuvees:(e==null?void 0:e.filter(o=>o.status==="approuvee").length)||0,refusees:(e==null?void 0:e.filter(o=>o.status==="refusee").length)||0,urgentes:(e==null?void 0:e.filter(o=>o.priority==="urgent").length)||0,nouvelles:(e==null?void 0:e.filter(o=>o.request_type==="nouvelle_inscription").length)||0,redoublements:(e==null?void 0:e.filter(o=>o.request_type==="redoublement").length)||0,transferts:(e==null?void 0:e.filter(o=>o.request_type==="transfert").length)||0},error:null}}catch(r){return console.error("Erreur récupération stats demandes:",r),{data:{totalDemandes:0,enAttente:0,enRevision:0,approuvees:0,refusees:0,urgentes:0,nouvelles:0,redoublements:0,transferts:0},error:r}}},async createEnrollmentRequest(t){try{this.ensureContext();const{data:r,error:e}=await i.from("enrollment_requests").insert({...t,school_id:t.school_id||this.currentSchoolId,submitted_by:t.submitted_by||this.currentUserId,submitted_date:new Date().toISOString()}).select().single();if(e)throw e;return console.log("Demande créée:",r.id),{data:r,error:null}}catch(r){return console.error("Erreur création demande:",r),{data:null,error:r}}},async updateEnrollmentRequest(t,r){try{this.ensureContext();const{data:e,error:n}=await i.from("enrollment_requests").update({...r,reviewed_by:r.reviewed_by||this.currentUserId,reviewed_date:new Date().toISOString()}).eq("id",t).eq("school_id",this.currentSchoolId).select().single();if(n)throw n;return console.log("Demande mise à jour:",t),{data:e,error:null}}catch(e){return console.error("Erreur mise à jour demande:",e),{data:null,error:e}}},async deleteEnrollmentRequest(t){try{this.ensureContext();const{error:r}=await i.from("enrollment_requests").delete().eq("id",t).eq("school_id",this.currentSchoolId).eq("status","annulee");if(r)throw r;return console.log("Demande supprimée:",t),{data:!0,error:null}}catch(r){return console.error("Erreur suppression demande:",r),{data:!1,error:r}}}};export{_ as p};
//# sourceMappingURL=productionDataService-T6uUAzM-.js.map
