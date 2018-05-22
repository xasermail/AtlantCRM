-- =============================================
-- Author:		Maynskiy Andrey
-- Create date: 14-01-2017
-- Description:	Информация для отчета Статистика
-- =============================================
if exists(select 1 from sys.procedures as a where a.name = 'GET_REPORT_ZABOL') drop procedure dbo.GET_REPORT_ZABOL;

GO

create procedure dbo.GET_REPORT_ZABOL
	@fromDate smalldatetime,
	@toDate smalldatetime,
	@m_org_id int
AS
BEGIN
/*declare @fromDate smalldatetime
set @fromDate = cast('2016-01-01' as datetime)

declare @toDate smalldatetime
set @toDate = cast('2017-02-01' as datetime)

declare @m_org_id int
set @m_org_id= 1
--*/
	--чтобы взят полный диапазон у начальной даты убираем время
	declare @usingFromDate smalldatetime
	set @usingFromDate = cast(@fromDate as date)
	--для конечной добавляем один день
	declare @usingToDate smalldatetime
	set @usingToDate = dateadd(day,1,cast(@toDate as date))

	select	top 15 max(z.[NAME]) as ZABOL_NAME
			, count(az.O_ANK_ID) as ZABOL_COUNT
	from	O_ANK as a
			inner join O_ANK_ZABOL as az on a.ID = az.O_ANK_ID
			inner join M_ZABOL as z on z.ID = az.M_ZABOL_ID
	where	@usingFromDate <= a.DATE_REG 
			and a.DATE_REG < @usingToDate
			and a.M_ORG_ID = @m_org_id 		
	group by z.ID
	order by ZABOL_COUNT desc
END 
GO