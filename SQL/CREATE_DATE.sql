/* создать дату с нулевым часовым по€сом */

BEGIN TRY
    DROP FUNCTION [dbo].[CREATE_DATE];
END TRY
BEGIN CATCH
    PRINT 'Function did not exist.';
END CATCH

GO

create function [dbo].[CREATE_DATE](
  -- организаци€
	@m_org_id int
) returns smalldatetime
	
as begin

declare @tz int;
select @tz = o.TZ from dbo.M_ORG o where o.ID = @m_org_id;

if (@tz is null) begin
  declare @err varchar(500);
	/*
	set @err = 'ќшибка при определении часового по€са дл€ M_ORG_ID = ' + @m_org_id;
  raiserror(@err, 15, 1);
	*/
	return cast(null as smalldatetime);
end;

declare @rslt smalldatetime;

select @rslt = dateadd(HOUR, @tz, getutcdate());

return @rslt;


end;

go

declare @m_org_id int = 1;
select dbo.CREATE_DATE(@m_org_id);