/* получить данные для режима База */

if exists(select 1 from sys.procedures as a where a.name = 'GET_SOPR_LIST') drop procedure dbo.GET_SOPR_LIST;

GO

create procedure [dbo].[GET_SOPR_LIST]
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

select * 
	into #data
	from (
select s.ID,
       a.ID O_ANK_ID,
       cast(ROW_NUMBER() over(order by a.DATE_REG desc) as int) RN,
       DATE_REG,
       isnull(a.NAME + ' ','') + isnull(a.SECNAME + ' ', '') + isnull(a.SURNAME, '') FIO,
       replace(replace(replace(replace(replace(replace(isnull(a.PHONE_MOBILE, a.PHONE_HOME),'+7','8'),'(',''),')',''),'-',''),' ',''),'+','') PHONE_NUM,
       isnull(a.PHONE_MOBILE, a.PHONE_HOME) PHONE,
       i.NAME IST,
       s.M_SOPR_PRODUCT_ID,
       s.M_SOPR_DOP_ID,
       s.M_SOPR_FORM_OPL_ID,
       isnull(s.M_SOPR_STATUS_ID, 0) M_SOPR_STATUS_ID,
       ss.VISITS,
       ss.LAST_VISIT,
       (select max(D_START) from dbo.O_SOPR_COMMENT c where c.M_ORG_ID = a.M_ORG_ID and c.O_SOPR_ID = s.ID) DATE_WORK,

       (select max(case when len(COMMENT) > 100 then substring(COMMENT,1,100)+'...' else COMMENT end) from (
          select COMMENT, ROW_NUMBER() over(order by c.ID desc) RN
            from dbo.O_SOPR_COMMENT c
           where c.M_ORG_ID = a.M_ORG_ID and c.O_SOPR_ID = s.ID and c.COMMENT is not null) b
         where b.RN = 1) COMMENT,

       (select max(ZADACHA) from (
          select ZADACHA, ROW_NUMBER() over(order by c.ID desc) RN
            from dbo.O_SOPR_COMMENT c
           where c.M_ORG_ID = a.M_ORG_ID and c.O_SOPR_ID = s.ID and c.ZADACHA is not null) b
         where b.RN = 1) ZADACHA,
       s.IS_SROCHNO,
       a.USER_REG
  from dbo.O_ANK a
	left join (
    select o.O_ANK_ID, max(o.D_REG) LAST_VISIT, count(*) VISITS from dbo.O_SEANS o
	   where cast(o.D_REG as date) <= cast(dbo.CREATE_DATE(2) as date)
		   and o.SEANS_STATE = 1 and m_org_id = 2
    group by o.O_ANK_ID) ss on a.ID = ss.O_ANK_ID
	left join dbo.O_SOPR s on a.ID = s.O_ANK_ID and s.M_ORG_ID = a.M_ORG_ID
	left join dbo.O_KONT_ANK k on a.ID = k.O_ANK_ID and k.M_ORG_ID = a.M_ORG_ID
	left join dbo.M_KONT_IST i on k.M_KONT_IST_ID = i.ID and i.M_ORG_ID = a.M_ORG_ID and i.ID <> 1 -- не задан
 where a.M_ORG_ID = @m_org_id) a
 where ((@stat = 0 and a.M_SOPR_STATUS_ID in (0,2,4,5,9)) or isnull(a.M_SOPR_STATUS_ID,-1) = @stat)
	 and (@text = '' or isnull(PHONE_NUM,'-') like '%'+replace(@text,' ','%')+'%' or isnull(FIO, '-') like '%'+replace(@text,' ','%')+'%')
	 and ((@dtfrom is null or @dtto is null) or (cast(a.DATE_REG as date) between cast(@dtfrom as date) and cast(@dtto as date) ))
   and ((@user = 0) or (a.USER_REG = @user));

 select @cnt = count(*) from #data;
 set @cnt_page = cast(@cnt / @rows_per_page as int);
 set @cnt_page = case when @cnt_page = 0 then 1 when @cnt_page * @rows_per_page < @cnt then @cnt_page + 1 end;
 update #data set VISITS = null where VISITS = 0;

select ID, O_ANK_ID, RN, DATE_REG, FIO, PHONE_NUM, PHONE, IST, M_SOPR_PRODUCT_ID, M_SOPR_DOP_ID,
       M_SOPR_FORM_OPL_ID, M_SOPR_STATUS_ID, VISITS, LAST_VISIT, DATE_WORK, COMMENT, ZADACHA, @cnt cnt, @cnt_page cnt_page,
       IS_SROCHNO
	from #data
 order by case when IS_SROCHNO = 1 then 999 else 1 end desc, RN desc
 offset (@page - 1) * @rows_per_page rows
 fetch next @rows_per_page rows only;

if object_id('tempdb..#data') is not null drop table #data;

end;

/*

go

set dateformat dmy;
exec dbo.GET_SOPR_LIST @page = 1, @rows_per_page = 50, @m_org_id = 2, @stat = 0, @text = '';

go

*/