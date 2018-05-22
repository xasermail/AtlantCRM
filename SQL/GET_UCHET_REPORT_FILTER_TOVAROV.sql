/* Учёт - Отчёты - Фильтр товаров */

if exists(select 1 from sys.procedures as a where a.name = 'GET_UCHET_REPORT_FILTER_TOVAROV') drop procedure dbo.GET_UCHET_REPORT_FILTER_TOVAROV;

GO

create procedure dbo.GET_UCHET_REPORT_FILTER_TOVAROV
	 @fromDate smalldatetime
	,@toDate smalldatetime
	,@m_org_id int
	,@page int
	,@rows_per_page int
	,@idsSpecialist varchar(4000)
	,@idsTovar varchar(4000)
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	
	
	declare @cnt int;
	select @cnt = count(*)
		from O_SKLAD_RAS_PRODUCT as SRP
		join O_SKLAD_RAS as SR on SR.ID = SRP.O_SKLAD_RAS_ID
	 where SR.M_ORG_ID = @m_org_id
		 and SR.D_SCHET >= @fromDate
		 and SR.D_SCHET <= @toDate
		 and (@idsSpecialist = '' or @idsSpecialist like '%,' + cast(sr.S_USER_ID as varchar(10)) + ',%')
		 and (@idsTovar = '' or @idsTovar like '%,' + cast(srp.M_PRODUCT_ID as varchar(10)) + ',%');
    
	select
     sr.ID as O_SKLAD_RAS_ID			--идентификатор расхода	
		,SR.D_SCHET					--дата
		,SRP.M_PRODUCT_ID				--идентификатор товара
		,p.[NAME] as PRODUCT_NAME		--название товара
		,SR.O_ANK_ID					--идентификатор анкеты покупателя
		,isnull(A.SURNAME, SR.SURNAME) as SURNAME_POKUP	--фамилия покупателя
		,isnull(A.[NAME], SR.NAME) as NAME_POKUP		--имя покупателя
		,isnull(A.SECNAME, SR.SECNAME) as SECNAME_POKUP	--отчетсво покупателя
		,SRP.COST						--цена
		,isnull(A.PHONE_MOBILE, SR.PHONE_MOBILE) PHONE_MOBILE--телефон
		,SR.S_USER_ID					--продавец
		,U.SURNAME	as SURNAME_SPECIALIST	--фамилия продавца
		,U.[NAME]	as NAME_SPECIALIST		--имя продавца
		,U.SECNAME	as SECNAME_SPECIALIST	--отчество продавца
		,@cnt as COUNT_ALL
    ,dbo.GET_ABON_DAY_COUNT_LAST(a.ID, @m_org_id) ostalos_dn_abon
  from
    dbo.O_SKLAD_RAS_PRODUCT as SRP
		join dbo.M_PRODUCT as P on p.ID = SRP.M_PRODUCT_ID
		join dbo.O_SKLAD_RAS as SR on SR.ID = SRP.O_SKLAD_RAS_ID
		left join dbo.O_ANK as A on A.ID = SR.O_ANK_ID
		left join dbo.S_USER as U on U.ID = SR.S_USER_ID
  where
    SR.M_ORG_ID = @m_org_id
		and SR.D_SCHET >= @fromDate
		and SR.D_SCHET <= @toDate
		and (@idsSpecialist = '' or @idsSpecialist like '%,' + cast(sr.S_USER_ID as varchar(10)) + ',%')
		and (@idsTovar = '' or @idsTovar like '%,' + cast(p.ID as varchar(10)) + ',%')
  order by
    SR.S_USER_ID, SR.D_SCHET
	offset
    (@page - 1) * @rows_per_page rows
	fetch next
    @rows_per_page rows only
  ;

END;

go

set dateformat dmy;
exec dbo.GET_UCHET_REPORT_FILTER_TOVAROV
	 @fromDate = '01.12.2017'
	,@toDate  = '28.02.2018'
	,@m_org_id = 2
	,@page = 1
	,@rows_per_page = 10
	,@idsSpecialist = ''
	,@idsTovar = ''
;