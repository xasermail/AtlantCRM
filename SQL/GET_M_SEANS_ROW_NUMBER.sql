/* получить номер времени сеанса в рамках дня */

if exists(select 1 from sys.procedures as a where a.name = 'GET_M_SEANS_ROW_NUMBER') drop procedure dbo.GET_M_SEANS_ROW_NUMBER;

GO

create procedure [dbo].[GET_M_SEANS_ROW_NUMBER]
	@m_seans_time_id int,
	@m_org_id int
as begin

declare @min_time varchar(500);

select @min_time = m.MIN_TIME from dbo.M_SEANS_TIME m where m.ID = @m_seans_time_id;

select
  count(*) + 1 rn
from
  dbo.M_SEANS_TIME t
where
  t.M_ORG_ID = @m_org_id
  and cast(substring(t.MIN_TIME, 1, 2) as int) * 60 + cast(substring(t.MIN_TIME, 4, 2) as int)
      <
      cast(substring(@min_time, 1, 2) as int) * 60 + cast(substring(@min_time, 4, 2) as int)
;
  
end;

go



exec dbo.GET_M_SEANS_ROW_NUMBER @m_seans_time_id = 20, @m_org_id = 1