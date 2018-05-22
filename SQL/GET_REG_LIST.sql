/* получить список зарегистрированных на сегодня */

if exists(select 1 from sys.procedures as a where a.name = 'GET_REG_LIST') drop procedure dbo.GET_REG_LIST;

GO

create procedure [dbo].[GET_REG_LIST]
	@m_seans_time_id int,
	@m_org_id int
as begin
  
  declare @d smalldatetime = cast(dbo.CREATE_DATE(@m_org_id) as date);
  

  select
    a.ID o_ank_id,
    case when month(a.BIRTHDAY) = month(@d) and day(a.BIRTHDAY) = day(@d) then 1 else 0 end is_birthday,
    a.VIP vip,
    dbo.GET_ABON_DAY_COUNT_LAST(a.ID, @m_org_id) ostalos_dn_abon,
    isnull(a.SURNAME, '') + ' ' + isnull(substring(a.NAME, 1, 1) + '. ', '') + isnull(substring(a.SECNAME, 1, 1)+ '.', '') fio,
    (select count(*) from dbo.O_SEANS o where o.O_ANK_ID = a.ID and cast(o.D_REG as date) <= cast(@d as date) and o.SEANS_STATE = 1 and o.M_ORG_ID = @m_org_id) seans_cnt,
    row_number() over(order by s.ID) rn
  from
    dbo.O_SEANS s
    join dbo.O_ANK a on a.ID = s.O_ANK_ID
  where
		s.M_SEANS_TIME_ID = @m_seans_time_id
		and cast(s.D_REG as date) = @d
    and s.M_ORG_ID = @m_org_id

 -- последний зарегистрированный отображается в самом верху
  order by
    s.ID desc
	;
  
end;

go



exec dbo.GET_REG_LIST @m_seans_time_id = 2, @m_org_id = 2;