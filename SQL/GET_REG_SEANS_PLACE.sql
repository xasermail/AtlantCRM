/* получить места для записи с указанием их занятости */

if exists(select 1 from sys.procedures as a where a.name = 'GET_REG_SEANS_PLACE') drop procedure dbo.GET_REG_SEANS_PLACE;

GO

create procedure [dbo].[GET_REG_SEANS_PLACE]
	@m_seans_time_id int,
	@m_ryad_id int,
	@m_org_id int
as begin
  
  declare @d smalldatetime = cast(dbo.CREATE_DATE(@m_org_id) as date);
  
	select
	  p.ID,
	  p.NAME,
	  case when o.cnt = 0 then 0 else 1 end zanyato,
    o.cnt zanyato_kolvo,
	  @m_seans_time_id M_SEANS_TIME_ID,
	  @m_ryad_id M_RYAD_ID
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
	  p.M_RYAD_ID = @m_ryad_id
	  and p.M_ORG_ID = @m_org_id
	;
  
end;

go



exec dbo.GET_REG_SEANS_PLACE @m_seans_time_id = 2, @m_ryad_id = 1, @m_org_id = 2;