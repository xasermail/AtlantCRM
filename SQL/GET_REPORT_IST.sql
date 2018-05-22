-- =============================================
-- Author:		Maynskiy Andrey
-- Create date: 25-01-2017
-- Description:	Отчет Источники
-- =============================================
if exists(select 1 from sys.procedures as a where a.name = 'GET_REPORT_IST') drop procedure dbo.GET_REPORT_IST;

GO

create procedure dbo.GET_REPORT_IST
	-- Add the parameters for the stored procedure here
	@fromDate smalldatetime,
	@toDate smalldatetime,
	@m_org_id int
AS
BEGIN

    /*
	declare @fromDate smalldatetime
	set @fromDate = cast('2017-01-01' as date)

	declare @toDate smalldatetime
	set @toDate = cast('2017-01-31' as date)

	declare @m_org_id int
	set @m_org_id = 1
	--*/
	SET NOCOUNT ON;

  declare @o_ank table(ID int, IST_INFO int, SALE int);
  insert into @o_ank(ID, IST_INFO, SALE)
  select
    a.ID,
    a.IST_INFO,
    (
      select
        count(*) 
      from
        dbo.O_SKLAD_RAS r
        join dbo.O_SKLAD_RAS_PRODUCT x on x.O_SKLAD_RAS_ID = r.ID
      where
        r.O_ANK_ID = a.ID and
        x.M_ORG_ID = @m_org_id and
        x.OPL_OST = 0 and
        x.COST > 0
    ) SALE
  from
    dbo.O_ANK as a
  where
	  a.M_ORG_ID = @m_org_id and 
	  (a.DATE_REG between @fromDate and @toDate)
  ;


	select	isnull(max(i.[NAME]), '(Отсутсвует или другой)') as [NAME]
			, count(a.ID) as COUNT_ANK
			, isnull(sum(a.SALE), 0) as SALE 
	from	M_IST_INF as i
			left join @o_ank as a on i.ID = a.IST_INFO  
	group by i.ID
	union all
	select	'(Отсутсвует или другой)' as [NAME]
			, count(a.ID) as COUNT_ANK
			, isnull(sum(a.SALE), 0) as SALE 
	from	@o_ank as a 
	where	a.IST_INFO is null
	
END
GO

set dateformat dmy;
declare @fromDate date = cast('01.04.2018' as date);
declare @toDate date = cast('30.04.2018' as date);
exec dbo.GET_REPORT_IST @fromDate, @toDate, 26;