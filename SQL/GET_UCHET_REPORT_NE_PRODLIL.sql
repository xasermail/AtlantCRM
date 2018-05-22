if exists(select 1 from sys.procedures as a where a.name = 'GET_UCHET_REPORT_NE_PRODLIL') drop procedure dbo.GET_UCHET_REPORT_NE_PRODLIL;

GO

create procedure [dbo].[GET_UCHET_REPORT_NE_PRODLIL]
	@m_org_id int = null as
begin
select max(a.o_ank_id) o_ank_id,
       max(a.fio) fio,
       max(a.phone) phone,
       max(a.vip) vip,
       max(a.ID) o_sklad_ras_id,
       max(a.m_product_id) m_product_id,
       max(a.name) name,
       max(a.price) summa,
       max(a.vid) vid,
       max(a.d_vid) d_vid,
       max(a.d_deistv) d_deistv,
       max(a.ostalos_dn_abon) ostalos_dn_abon,
       max(a.seans_cnt) seans_cnt,
       max(a.o_sklad_ras_product_id) o_sklad_ras_product_id
  from (
        -- есть анкета
        select m.id m_product_id,
               r.o_ank_id,
               isnull(a.surname + ' ','') + isnull(a.name + ' ',' ') + isnull(a.secname,'') fio,
               isnull(a.phone_mobile, a.phone_home) phone,
               isnull(a.vip, 0) vip,
               isnull(o.opl,0) summa,
               isnull(p.tsena,0) price,
               r.id,
               p.id o_sklad_ras_product_id,
               dbo.GET_ABON_DAY_COUNT(p.D_DEISTV, @m_org_id) ostalos_dn_abon,
               (select count(*) from dbo.O_SEANS o where o.O_ANK_ID = a.ID and o.SEANS_STATE = 1 and o.M_ORG_ID = @m_org_id) seans_cnt,
               case when isnull(p.is_vid,0) = 1 then 'Да' else 'Нет' end vid,
               p.d_vid,
               p.d_deistv,
               m.name
          from o_sklad_ras r
          join o_sklad_ras_product p on r.id = p.o_sklad_ras_id
          join o_sklad_ras_product_opl o on o.o_sklad_ras_product_id = p.id
          join o_ank a on r.o_ank_id = a.id
          join m_product m on p.m_product_id = m.id and m.IS_ABON = 1
         where r.m_org_id = @m_org_id
           and isnull(p.opl_ost,0) = 0
           and isnull(p.cost,0) > 0
           and (p.D_DEISTV is not null and p.D_DEISTV < dbo.CREATE_DATE(@m_org_id))
           and not exists (select 1 from o_sklad_ras sr  -- нет нового абонемента
                                    join o_sklad_ras_product srp on sr.id = srp.o_sklad_ras_id
                                    join m_product nm on srp.m_product_id = nm.id and nm.IS_ABON = 1
                              where sr.m_org_id = @m_org_id
                                and isnull(srp.cost,0) > 0
                                and srp.D_VID > p.D_DEISTV and sr.o_ank_id = a.id and srp.IS_VID = 1)
         union
         -- без анкеты
         select m.id m_product_id,
                r.o_ank_id,
                isnull(r.surname + ' ','') + isnull(r.name + ' ',' ') + isnull(r.secname,'') fio,
                r.phone_mobile phone,
                null vip,
                isnull(o.opl,0) summa,
                isnull(p.tsena,0) price,
                r.id,
                p.id o_sklad_ras_product_id,
                dbo.GET_ABON_DAY_COUNT(p.D_DEISTV, @m_org_id) ostalos_dn_abon,
                null seans_cnt,
                case when isnull(p.is_vid,0) = 1 then 'Да' else 'Нет' end vid,
                p.d_vid,
                p.d_deistv,
                m.name
           from o_sklad_ras r
           join o_sklad_ras_product p on r.id = p.o_sklad_ras_id
           join o_sklad_ras_product_opl o on o.o_sklad_ras_product_id = p.id
           join m_product m on p.m_product_id = m.id and m.IS_ABON = 1
          where r.o_ank_id is null
            and r.m_org_id = @m_org_id
            and isnull(p.opl_ost,0) = 0
            and isnull(p.cost,0) > 0
            and (p.D_DEISTV is not null and p.D_DEISTV < dbo.CREATE_DATE(@m_org_id))
            and not exists (select 1 from o_sklad_ras sr  -- нет нового абонемента
                                     join o_sklad_ras_product srp on sr.id = srp.o_sklad_ras_id
                                     join m_product nm on srp.m_product_id = nm.id and nm.IS_ABON = 1
                               where sr.m_org_id = @m_org_id
                                 and isnull(srp.cost,0) > 0
                                 and srp.D_VID > p.D_DEISTV and sr.id = r.id and srp.IS_VID = 1)
        ) a
 group by a.o_sklad_ras_product_id
 order by max(a.m_product_id), max(a.fio);
end;