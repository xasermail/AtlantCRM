/* получить первое свободное место для записи (или не свободное, если свободных нет) */

if exists(select 1 from sys.procedures as a where a.name = 'GET_REG_FREE_PLACE') drop procedure dbo.GET_REG_FREE_PLACE;

GO

create procedure [dbo].[GET_REG_FREE_PLACE]
	@m_seans_time_id int,
	@m_org_id int
as begin
  
  declare @d smalldatetime = cast(dbo.CREATE_DATE(@m_org_id) as date);
  
	select
	  p.ID,
	  @m_seans_time_id M_SEANS_TIME_ID,
	  p.M_RYAD_ID M_RYAD_ID
	from
	  dbo.M_SEANS_PLACE p
	  outer apply 
      (
      select
        count(*) cnt
      from
        dbo.O_SEANS oInner
      where
		    oInner.M_SEANS_PLACE_ID = p.ID
		    and oInner.M_SEANS_TIME_ID = @m_seans_time_id
		    and cast(oInner.D_REG as date) = @d
      ) o
	where
    p.M_ORG_ID = @m_org_id

  -- возьмём первое место, на которое меньше всего зарегистрировалось
  -- и которое из них меньше по ID, чтобы регистрировать равномерно
  order by
    o.cnt asc,
    p.ID asc
	;
  
end;

go



exec dbo.GET_REG_FREE_PLACE @m_seans_time_id = 3, @m_org_id = 2;