-- =============================================
-- Author:		Maynskiy Andrey
-- Create date: 22.04.2017
-- Description:	¬озвращает список количества уведомлений по дн€м
-- =============================================
if exists(select 1 from sys.procedures as a where a.name = 'GET_UVEDOML_COUNT_BY_DATE') drop procedure dbo.GET_UVEDOML_COUNT_BY_DATE;

GO

create procedure [dbo].[GET_UVEDOML_COUNT_BY_DATE]
	@m_org_id int,
	@startDate smalldatetime,
	@endDate smalldatetime
AS	 
BEGIN
/*
	declare @m_org_id int
	set @m_org_id = 1
	declare @startDate smalldatetime = '2017-02-10 00:00:00'
	declare @endDate smalldatetime = '2017-05-20 00:00:00'
--*/
	SET NOCOUNT ON;

	select	u.D_SOB,count(u.[ID]) as CountUvedoml
	from	O_UVEDOML as u
	where	u.M_ORG_ID = @m_org_id
			and u.ISP = 0
			and u.D_SOB <= @endDate
			and u.D_SOB >= @startDate
	group by u.D_SOB
END