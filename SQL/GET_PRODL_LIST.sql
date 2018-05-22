/* получить данные для режима База */

if exists(select 1 from sys.procedures as a where a.name = 'GET_PRODL_LIST') drop procedure dbo.GET_PRODL_LIST;

GO

create procedure [dbo].[GET_PRODL_LIST]
	@page int = 1,
	@rows_per_page int = 50,
	@m_org_id int = 2,
	@stat int = 0,
	@text varchar(4000) = '',
	@dtfrom smalldatetime = null,
	@dtto smalldatetime = null,
	@user int = 0
as begin

declare
	@cnt int = 0,
	@cnt_page int = 0;

set dateformat dmy;
if object_id('tempdb..#data') is not null drop table #data;

set @dtfrom = case when cast(@dtfrom as date) = cast('01.01.1950' as smalldatetime) then null else @dtfrom end;
set @dtto = case when cast(@dtto as date) = cast('01.01.1950' as smalldatetime) then null else @dtto end;

select *,
       ROW_NUMBER() over(order by D_VID desc) RN1
	into #data
	from (
select p.ID,
       a.ID O_ANK_ID,
       0 RN,
       isnull(a.NAME + ' ','') + isnull(a.SECNAME + ' ', '') + isnull(a.SURNAME, '') FIO,
       replace(replace(replace(replace(replace(replace(isnull(a.PHONE_MOBILE, a.PHONE_HOME),'+7','8'),'(',''),')',''),'-',''),' ',''),'+','') PHONE_NUM,
       isnull(a.PHONE_MOBILE, a.PHONE_HOME) PHONE,
       dbo.GET_ABON_DAY_COUNT_LAST(a.ID, a.M_ORG_ID) OST,
       t.NAME M_PRODUCT_NAME,

       (select max(m.NAME) from (
          select M_METOD_OPL_ID, ROW_NUMBER() over(order by c.ID desc) RN
            from dbo.O_SKLAD_RAS_PRODUCT_OPL c
           where c.M_ORG_ID = a.M_ORG_ID and c.O_SKLAD_RAS_PRODUCT_ID = pr.O_SKLAD_RAS_PRODUCT_ID and c.M_METOD_OPL_ID is not null) b
          join dbo.M_METOD_OPL m on b.M_METOD_OPL_ID = m.ID
         where b.RN = 1) M_FORM_OPL,

       isnull(p.M_SOPR_STATUS_ID, 0) M_SOPR_STATUS_ID,

       (select count(*) from dbo.O_SEANS o
         where o.o_ank_id = a.ID and cast(o.D_REG as date) <= cast(dbo.CREATE_DATE(@m_org_id) as date)
           and o.SEANS_STATE = 1 and m_org_id = a.M_ORG_ID) VISITS,

       (select max(o.D_REG) from dbo.O_SEANS o
         where o.o_ank_id = a.ID and cast(o.D_REG as date) <= cast(dbo.CREATE_DATE(@m_org_id) as date)
           and o.SEANS_STATE = 1 and m_org_id = a.M_ORG_ID) LAST_VISIT,
       (select max(D_START) from dbo.O_PRODL_COMMENT c where c.M_ORG_ID = a.M_ORG_ID and c.O_PRODL_ID = p.ID) DATE_WORK,

       (select max(case when len(COMMENT) > 100 then substring(COMMENT,1,100)+'...' else COMMENT end) from (
          select COMMENT, ROW_NUMBER() over(order by c.ID desc) RN
            from dbo.O_PRODL_COMMENT c
           where c.M_ORG_ID = a.M_ORG_ID and c.O_PRODL_ID = p.ID and c.COMMENT is not null) b
         where b.RN = 1) COMMENT,

       (select max(ZADACHA) from (
          select ZADACHA, ROW_NUMBER() over(order by c.ID desc) RN
            from dbo.O_PRODL_COMMENT c
           where c.M_ORG_ID = a.M_ORG_ID and c.O_PRODL_ID = p.ID and c.ZADACHA is not null) b
         where b.RN = 1) ZADACHA,

       isnull(p.IS_SROCHNO,1) IS_SROCHNO,
       rp.D_DEISTV,
       rp.D_VID,
       a.VIP,
			 a.USER_REG
  from dbo.O_ANK a
	left join dbo.O_PRODL p on a.ID = p.O_ANK_ID and p.M_ORG_ID = a.M_ORG_ID
	left join (
		select r.O_ANK_ID, max(pr.ID) O_SKLAD_RAS_PRODUCT_ID
		  from dbo.O_SKLAD_RAS r
			join dbo.O_SKLAD_RAS_PRODUCT pr on r.ID = pr.O_SKLAD_RAS_ID and pr.M_ORG_ID = r.M_ORG_ID
			join dbo.M_PRODUCT t on pr.M_PRODUCT_ID = t.ID and t.IS_ABON = 1
		 where r.O_ANK_ID is not null and r.M_ORG_ID = @m_org_id and pr.D_DEISTV is not null
		 group by r.O_ANK_ID
	) pr on pr.O_ANK_ID = a.ID
	left join dbo.O_SKLAD_RAS_PRODUCT rp on rp.ID = pr.O_SKLAD_RAS_PRODUCT_ID and rp.M_ORG_ID = a.M_ORG_ID
	join dbo.M_PRODUCT t on rp.M_PRODUCT_ID = t.ID and t.IS_ABON = 1
 where a.M_ORG_ID = @m_org_id) a
 where ((@stat = 0 and a.M_SOPR_STATUS_ID in (0,2,4,5,9)) or isnull(a.M_SOPR_STATUS_ID,-1) = @stat)
   and (@text = '' or isnull(PHONE_NUM,'-') like '%'+replace(@text,' ','%')+'%' or isnull(FIO, '-') like '%'+replace(@text,' ','%')+'%')
   and ((@dtfrom is null or @dtto is null) or (cast(a.D_VID as date) between cast(@dtfrom as date) and cast(@dtto as date) ))
   and ((@user = 0) or (a.USER_REG = @user))
   and datediff(DAY, dbo.CREATE_DATE(@m_org_id), isnull(a.D_DEISTV,dbo.CREATE_DATE(@m_org_id))) <= 14;

 select @cnt = count(*) from #data;
 set @cnt_page = cast(@cnt / @rows_per_page as int);
 set @cnt_page = case when @cnt_page = 0 then 1 when @cnt_page * @rows_per_page < @cnt then @cnt_page + 1 end;
 update #data set VISITS = null where VISITS = 0;

 update d1
    set d1.RN = d2.RN
   from #data d1
	 join (
	   select ID, cast(ROW_NUMBER() over(order by OST desc, D_VID desc) as int) RN, RN1 from #data 
	 ) d2 on isnull(d1.ID,d1.RN1) = isnull(d2.ID,d2.RN1);

update #data set OST = 0, IS_SROCHNO = 0 where OST <= 0;

select ID, O_ANK_ID, RN, D_VID, FIO, PHONE_NUM, PHONE, OST, M_PRODUCT_NAME, M_FORM_OPL, M_SOPR_STATUS_ID, VISITS, 
       LAST_VISIT, DATE_WORK, COMMENT, ZADACHA, @cnt cnt, @cnt_page cnt_page, IS_SROCHNO, VIP, D_DEISTV
	from #data
 order by case when IS_SROCHNO = 1 then 999 when OST = 0 then 1000 else 1 end desc, RN desc
 offset (@page - 1) * @rows_per_page rows
 fetch next @rows_per_page rows only;

if object_id('tempdb..#data') is not null drop table #data;

end;

/*

go

set dateformat dmy;
exec dbo.GET_PRODL_LIST @page = 1, @rows_per_page = 50, @m_org_id = 2, @stat = 0, @text = '';

go

*/