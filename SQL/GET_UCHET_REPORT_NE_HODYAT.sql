if exists(select 1 from sys.procedures as a where a.name = 'GET_UCHET_REPORT_NE_HODYAT') drop procedure dbo.GET_UCHET_REPORT_NE_HODYAT;

GO

create procedure [dbo].[GET_UCHET_REPORT_NE_HODYAT]
  @page int,
  @rows_per_page int,
	@m_org_id int
as
begin

declare
  @cnt int = 0,
  @cnt_page int = 0;

set dateformat dmy;
if object_id('tempdb..#data') is not null drop table #data;

select VIP, FIO, D_VID, PHONE, NAME, VID, SUMMA, O_ANK_ID, OSTALOS_DN_ABON, O_SKLAD_RAS_ID, VISITS,
       cast(ROW_NUMBER() over(order by a.DATE_REG desc) as int) RN,
			 case when datediff(DAY, a.LAST_REG, dbo.CREATE_DATE(@m_org_id)) >= 30 then cast(a.LAST_REG + 30 as date) else null end NE_HODIT_DATE
  into #data
  from (
    select *
      from (
        select a.VIP,
               isnull(a.SURNAME,'') + ' ' + isnull(substring(a.NAME,1,1)+ '. ','') + isnull(substring(a.SECNAME,1,1)+ '.','') FIO,
               b.D_VID,
               isnull(a.PHONE_MOBILE, a.PHONE_HOME) PHONE,
               b.NAME,
               case when b.IS_VID = 1 then 'Да' else null end VID,
               (select sum(isnull(OPL,0)) from dbo.O_SKLAD_RAS_PRODUCT_OPL o where o.O_SKLAD_RAS_PRODUCT_ID = b.O_SKLAD_RAS_PRODUCT_ID) SUMMA,
               a.ID O_ANK_ID,
               case when b.IS_ABON = 1 then b.OST else null end OSTALOS_DN_ABON,
               b.O_SKLAD_RAS_ID,
               (select count(*) from dbo.O_SEANS o
                 where o.o_ank_id = a.ID and cast(o.D_REG as date) <= cast(dbo.CREATE_DATE(a.M_ORG_ID) as date)
                   and o.SEANS_STATE = 1 and m_org_id = a.M_ORG_ID) VISITS,
               (select max(s.D_REG) from dbo.O_SEANS s where s.O_ANK_ID = a.ID and s.SEANS_STATE = 1 and s.M_ORG_ID = a.M_ORG_ID) LAST_REG,
               a.DATE_REG
          from dbo.O_ANK a
          left join (
            select sr.O_ANK_ID, t.NAME, t.IS_ABON, dbo.GET_ABON_DAY_COUNT(srp.D_DEISTV, sr.M_ORG_ID) OST, srp.D_VID, srp.IS_VID, sr.ID O_SKLAD_RAS_ID,
                   srp.ID O_SKLAD_RAS_PRODUCT_ID, row_number() over(partition by sr.O_ANK_ID order by srp.ID desc) RN
              from dbo.O_SKLAD_RAS sr
              join dbo.O_SKLAD_RAS_PRODUCT srp on sr.ID = srp.O_SKLAD_RAS_ID
              join dbo.M_PRODUCT t on srp.M_PRODUCT_ID = t.ID
             where sr.O_ANK_ID is not null and sr.M_ORG_ID = @m_org_id
               and isnull(srp.COST,0) != 0
          ) b on a.ID = b.O_ANK_ID and b.RN = 1
         where a.M_ORG_ID = @m_org_id
           and (a.D_SKRYT_PO is null or a.D_SKRYT_PO < dbo.CREATE_DATE(@m_org_id))) a
 where datediff(DAY, a.LAST_REG, dbo.CREATE_DATE(@m_org_id)) >= 14
) a;

select @cnt = count(*) from #data;
set @cnt_page = cast(@cnt / @rows_per_page as int);
set @cnt_page = case when @cnt_page = 0 then 1 when @cnt_page * @rows_per_page < @cnt then @cnt_page + 1 end;
update #data set VISITS = null where VISITS = 0;

select VIP, FIO, D_VID, PHONE, NAME, VID, SUMMA, O_ANK_ID, OSTALOS_DN_ABON, O_SKLAD_RAS_ID, VISITS, RN,  @cnt cnt, @cnt_page cnt_page, NE_HODIT_DATE
  from #data
 order by RN
 offset (@page - 1) * @rows_per_page rows
 fetch next @rows_per_page rows only;

if object_id('tempdb..#data') is not null drop table #data;
end;

go

set dateformat dmy;
exec [dbo].[GET_UCHET_REPORT_NE_HODYAT] @page = 1, @rows_per_page = 50, @m_org_id = 2;