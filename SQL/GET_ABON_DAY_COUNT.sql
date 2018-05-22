/* вернуть количество дней до окончания действия абонемента */

BEGIN TRY
  DROP FUNCTION [dbo].[GET_ABON_DAY_COUNT];
END TRY
BEGIN CATCH
  PRINT 'Function did not exist.';
END CATCH

GO

create function [dbo].[GET_ABON_DAY_COUNT](
  -- дата окончания действия абонемента
  @d_deistv smalldatetime,
  @m_org_id int
) returns int
	
as begin


  return datediff(day, dbo.CREATE_DATE(@m_org_id), @d_deistv);

end;

go

set dateformat dmy;
declare @d_deistv smalldatetime = cast('28.01.2018' as date);
declare @m_org_id int = 1;
select dbo.GET_ABON_DAY_COUNT(@d_deistv, @m_org_id);