if exists(select 1 from sys.procedures as a where a.name = 'GET_SKLAD_DEBET_ZADOL_DATA') drop procedure dbo.GET_SKLAD_DEBET_ZADOL_DATA;

GO

create procedure [dbo].[GET_SKLAD_DEBET_ZADOL_DATA]
	@m_org_id int = null as
begin
select *, case when isnull(datediff(day,getdate(),d_next_opl),3) <= 2 then 1 else 999 end rn from (
select max(a.m_product_id) m_product_id,
			 max(a.d_opl) d_opl,
			 max(a.fio) fio,
			 max(a.phone) phone,
			 max(a.price) - sum(a.summa) summa,
			 max(a.o_ank_id) o_ank_id,
			 max(a.ID) o_sklad_ras_id,
			 max(a.D_SOB) d_next_opl
	from (
			 	-- есть анкета
			 	select m.id m_product_id,
			 				 isnull(a.surname + ' ','') +
			 				 isnull(a.name + ' ',' ') +
			 				 isnull(a.secname,'') fio,
			 				 isnull(a.phone_mobile, a.phone_home) phone,
			 				 o.d_opl,
			 				 isnull(o.opl,0) summa,
			 				 r.o_ank_id,
			 				 isnull(p.cost,0) price,
			 				 r.id,
							 p.id o_sklad_ras_product_id,
							 u.D_SOB
			 		from o_sklad_ras r
			 		join o_sklad_ras_product p on r.id = p.o_sklad_ras_id
			 		join o_sklad_ras_product_opl o on o.o_sklad_ras_product_id = p.id
			 		join o_ank a on r.o_ank_id = a.id
			 	  join m_product m on p.m_product_id = m.id
					left join dbo.O_UVEDOML u on u.O_SKLAD_RAS_ID = r.ID and u.O_SKLAD_RAS_NOMER = 1
				 where r.m_org_id = @m_org_id
					 and isnull(o.opl,0) > 0
					 and isnull(p.cost,0) > 0
			 	union
			 	-- без анкеты
			 	select m.id m_product_id,
			 				 isnull(r.surname + ' ','') +
			 				 isnull(r.name + ' ',' ') +
			 				 isnull(r.secname,'') fio,
			 				 r.phone_mobile phone,
			 				 o.d_opl,
			 				 isnull(o.opl,0) summa,
			 				 r.o_ank_id,
			 				 isnull(p.cost,0) price,
			 				 r.id,
							 p.id o_sklad_ras_product_id,
							 u.D_SOB
			 		from o_sklad_ras r
			 		join o_sklad_ras_product p on r.id = p.o_sklad_ras_id
			 		join o_sklad_ras_product_opl o on o.o_sklad_ras_product_id = p.id
			 		join m_product m on p.m_product_id = m.id
					left join dbo.O_UVEDOML u on u.O_SKLAD_RAS_ID = r.ID and u.O_SKLAD_RAS_NOMER = 1
			 	 where r.o_ank_id is null
			 		 and r.m_org_id = @m_org_id
					 and isnull(o.opl,0) > 0
					 and isnull(p.cost,0) > 0
		   ) a
 group by a.o_sklad_ras_product_id
 having (max(a.price) - sum(a.summa)) > 0) b
 order by rn, m_product_id, fio;
end;


go

exec dbo.GET_SKLAD_DEBET_ZADOL_DATA @m_org_id = 20