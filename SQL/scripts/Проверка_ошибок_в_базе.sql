select null [1], * from dbo.O_SEANS where SEANS_STATE = 1 and M_RYAD_ID is null

select null [2], * from dbo.O_SEANS where SEANS_STATE = 1 and M_SEANS_PLACE_ID is null

select null [3], * from dbo.O_SEANS where D_START is null

select null [4], * from dbo.o_seans o where not exists(select * from dbo.o_ank a where a.id = o.o_ank_id)

select null [5], * from
  dbo.O_SEANS s
	join (
		select
		  o.O_ANK_ID
			,cast(coalesce(o.D_REG, o.SEANS_DATE, o.D_START) as date) dt
	  from dbo.O_SEANS o
		group by o.O_ANK_ID, cast(coalesce(o.D_REG, o.SEANS_DATE, o.D_START) as date) having count(*) > 1
  ) b on s.O_ANK_ID = b.O_ANK_ID
	        and cast(coalesce(s.D_REG, s.SEANS_DATE, s.D_START) as date) = b.dt
order by
  s.O_ANK_ID, s.ID



select
  null [6], *
from
  (
		select o.*, row_number() over(partition by o.PHONE order by o.ID desc) rn from dbo.O_KONT_ANK o where o.PHONE in (

		select PHONE from dbo.o_kont_ank group by PHONE having count(*) > 1

		)
	) m



select
  null [7], *
from
  dbo.O_ANK a
	join dbo.O_KONT_ANK k on a.PHONE_MOBILE = k.PHONE
where
  k.SKR = 0


select null [8], * from dbo.o_seans where d_modif is null;


select null [9], * from dbo.o_seans where seans_date <> cast(seans_date as date)


select null [10], * from dbo.o_kont_ank where d_start is null

select null [11], * from dbo.O_SEANS where USERID is null

select null [12], * from dbo.O_SEANS where USERID_REG is null and SEANS_STATE = 1

select null [13], * from dbo.O_STATUS where STATUS_DATE != cast(status_date as date)