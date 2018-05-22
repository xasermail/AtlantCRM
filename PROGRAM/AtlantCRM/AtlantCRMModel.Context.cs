﻿//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated from a template.
//
//     Manual changes to this file may cause unexpected behavior in your application.
//     Manual changes to this file will be overwritten if the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

namespace AtlantCRM
{
    using System;
    using System.Data.Entity;
    using System.Data.Entity.Infrastructure;
    
    public partial class ATLANTEntities : DbContext
    {
        public ATLANTEntities()
            : base("name=ATLANTEntities")
        {
          ((IObjectContextAdapter)this).ObjectContext.CommandTimeout = 600;
        }
    
        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            throw new UnintentionalCodeFirstException();
        }
    
        public virtual DbSet<C__MigrationHistory> C__MigrationHistory { get; set; }
        public virtual DbSet<AspNetRoles> AspNetRoles { get; set; }
        public virtual DbSet<AspNetUserClaims> AspNetUserClaims { get; set; }
        public virtual DbSet<AspNetUserLogins> AspNetUserLogins { get; set; }
        public virtual DbSet<AspNetUsers> AspNetUsers { get; set; }
        public virtual DbSet<M_DEISTV> M_DEISTV { get; set; }
        public virtual DbSet<M_IST_INF> M_IST_INF { get; set; }
        public virtual DbSet<M_KONT_IST> M_KONT_IST { get; set; }
        public virtual DbSet<M_KONT_STATUS> M_KONT_STATUS { get; set; }
        public virtual DbSet<M_MANUAL> M_MANUAL { get; set; }
        public virtual DbSet<M_METOD_OPL> M_METOD_OPL { get; set; }
        public virtual DbSet<M_NAME_AND_SEX> M_NAME_AND_SEX { get; set; }
        public virtual DbSet<M_ORG> M_ORG { get; set; }
        public virtual DbSet<M_ORG_TYPE> M_ORG_TYPE { get; set; }
        public virtual DbSet<M_PRAVO_GR> M_PRAVO_GR { get; set; }
        public virtual DbSet<M_PRAVO_REJ> M_PRAVO_REJ { get; set; }
        public virtual DbSet<M_PRICH_ISKL> M_PRICH_ISKL { get; set; }
        public virtual DbSet<M_PRODUCT> M_PRODUCT { get; set; }
        public virtual DbSet<M_RASHOD_STAT> M_RASHOD_STAT { get; set; }
        public virtual DbSet<M_RYAD> M_RYAD { get; set; }
        public virtual DbSet<M_SEANS_PLACE> M_SEANS_PLACE { get; set; }
        public virtual DbSet<M_SEANS_TIME> M_SEANS_TIME { get; set; }
        public virtual DbSet<M_SECNAME> M_SECNAME { get; set; }
        public virtual DbSet<M_SERVICE_TYPE> M_SERVICE_TYPE { get; set; }
        public virtual DbSet<M_SEX> M_SEX { get; set; }
        public virtual DbSet<M_SHABLON> M_SHABLON { get; set; }
        public virtual DbSet<M_SMS_SEND_ERROR> M_SMS_SEND_ERROR { get; set; }
        public virtual DbSet<M_SOPR_DOP> M_SOPR_DOP { get; set; }
        public virtual DbSet<M_SOPR_FORM_OPL> M_SOPR_FORM_OPL { get; set; }
        public virtual DbSet<M_SOPR_PRODUCT> M_SOPR_PRODUCT { get; set; }
        public virtual DbSet<M_SOPR_STATUS> M_SOPR_STATUS { get; set; }
        public virtual DbSet<M_STATUS> M_STATUS { get; set; }
        public virtual DbSet<M_SURNAME> M_SURNAME { get; set; }
        public virtual DbSet<M_VID_SOB> M_VID_SOB { get; set; }
        public virtual DbSet<M_VOPROS> M_VOPROS { get; set; }
        public virtual DbSet<M_VOPROS_TAB> M_VOPROS_TAB { get; set; }
        public virtual DbSet<M_WORK_DAY> M_WORK_DAY { get; set; }
        public virtual DbSet<M_YES_NO> M_YES_NO { get; set; }
        public virtual DbSet<M_ZABOL> M_ZABOL { get; set; }
        public virtual DbSet<M_ZABOL_GROUP> M_ZABOL_GROUP { get; set; }
        public virtual DbSet<O_ANK> O_ANK { get; set; }
        public virtual DbSet<O_ANK_ZABOL> O_ANK_ZABOL { get; set; }
        public virtual DbSet<O_COMPLAINT> O_COMPLAINT { get; set; }
        public virtual DbSet<O_DEISTV> O_DEISTV { get; set; }
        public virtual DbSet<O_DIALOG> O_DIALOG { get; set; }
        public virtual DbSet<O_DILER_A_PRICE> O_DILER_A_PRICE { get; set; }
        public virtual DbSet<O_DILER_A_SKLAD> O_DILER_A_SKLAD { get; set; }
        public virtual DbSet<O_DILER_C_SKLAD> O_DILER_C_SKLAD { get; set; }
        public virtual DbSet<O_INVENT> O_INVENT { get; set; }
        public virtual DbSet<O_KALEN_PROD> O_KALEN_PROD { get; set; }
        public virtual DbSet<O_KONT_SEANS> O_KONT_SEANS { get; set; }
        public virtual DbSet<O_KONT_SEANS_COMMENT> O_KONT_SEANS_COMMENT { get; set; }
        public virtual DbSet<O_KONT_STAT> O_KONT_STAT { get; set; }
        public virtual DbSet<O_NASTR> O_NASTR { get; set; }
        public virtual DbSet<O_OPOV> O_OPOV { get; set; }
        public virtual DbSet<O_PRAVO_GR> O_PRAVO_GR { get; set; }
        public virtual DbSet<O_PRAVO_REJ> O_PRAVO_REJ { get; set; }
        public virtual DbSet<O_PRODL> O_PRODL { get; set; }
        public virtual DbSet<O_PRODL_COMMENT> O_PRODL_COMMENT { get; set; }
        public virtual DbSet<O_RAS_DOK> O_RAS_DOK { get; set; }
        public virtual DbSet<O_REK_ANK> O_REK_ANK { get; set; }
        public virtual DbSet<O_REPORT_BIRTHDAY_CALL> O_REPORT_BIRTHDAY_CALL { get; set; }
        public virtual DbSet<O_SEANS> O_SEANS { get; set; }
        public virtual DbSet<O_SEANS_COMMENT> O_SEANS_COMMENT { get; set; }
        public virtual DbSet<O_SERVICE> O_SERVICE { get; set; }
        public virtual DbSet<O_SKLAD_PR> O_SKLAD_PR { get; set; }
        public virtual DbSet<O_SKLAD_PR_PRODUCT> O_SKLAD_PR_PRODUCT { get; set; }
        public virtual DbSet<O_SKLAD_RAS> O_SKLAD_RAS { get; set; }
        public virtual DbSet<O_SKLAD_RAS_PRODUCT_OPL> O_SKLAD_RAS_PRODUCT_OPL { get; set; }
        public virtual DbSet<O_SMS_SEND> O_SMS_SEND { get; set; }
        public virtual DbSet<O_SOPR> O_SOPR { get; set; }
        public virtual DbSet<O_SOPR_COMMENT> O_SOPR_COMMENT { get; set; }
        public virtual DbSet<O_STATUS> O_STATUS { get; set; }
        public virtual DbSet<O_UVEDOML> O_UVEDOML { get; set; }
        public virtual DbSet<O_UVEDOML_GR_COMMENT> O_UVEDOML_GR_COMMENT { get; set; }
        public virtual DbSet<O_VIPIS> O_VIPIS { get; set; }
        public virtual DbSet<O_VIPIS_FILE_ULUCH> O_VIPIS_FILE_ULUCH { get; set; }
        public virtual DbSet<O_VIPIS_FILE_ZABOL> O_VIPIS_FILE_ZABOL { get; set; }
        public virtual DbSet<O_VIPIS_ULUCH> O_VIPIS_ULUCH { get; set; }
        public virtual DbSet<O_VOPROS> O_VOPROS { get; set; }
        public virtual DbSet<O_ZADACHA> O_ZADACHA { get; set; }
        public virtual DbSet<O_ZARPL> O_ZARPL { get; set; }
        public virtual DbSet<O_ZARPL_FIO> O_ZARPL_FIO { get; set; }
        public virtual DbSet<O_ZVONOK> O_ZVONOK { get; set; }
        public virtual DbSet<S_USER> S_USER { get; set; }
        public virtual DbSet<S_USER_ROLE> S_USER_ROLE { get; set; }
        public virtual DbSet<S_USER_SIGN_LOG> S_USER_SIGN_LOG { get; set; }
        public virtual DbSet<O_MOTIV> O_MOTIV { get; set; }
        public virtual DbSet<M_SMS_TEMPLATE_TYPE> M_SMS_TEMPLATE_TYPE { get; set; }
        public virtual DbSet<M_SMS_TEMPLATE> M_SMS_TEMPLATE { get; set; }
        public virtual DbSet<O_ABON_PRIOST> O_ABON_PRIOST { get; set; }
        public virtual DbSet<M_PRODUCT_ORG> M_PRODUCT_ORG { get; set; }
        public virtual DbSet<O_SKLAD_RAS_PRODUCT> O_SKLAD_RAS_PRODUCT { get; set; }
        public virtual DbSet<O_ABON_DOP_USL_IZM> O_ABON_DOP_USL_IZM { get; set; }
        public virtual DbSet<O_KONT_ANK> O_KONT_ANK { get; set; }
    }
}
