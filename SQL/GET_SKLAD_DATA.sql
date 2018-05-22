
if exists(select 1 from sys.procedures as a where a.name = 'GET_SKLAD_DATA') drop procedure dbo.GET_SKLAD_DATA;

GO

create procedure [dbo].[GET_SKLAD_DATA]
	@m_org_id int = null as
begin
	select * from (
		select p.id, p.name, sum(kolvo) kolvo, sum(cost) cost from (
			-- приход
			select c.m_product_id, 
						 isnull(c.kolvo,0) kolvo, 
						 isnull(c.kolvo,0) * isnull(c.cost,0) cost -- итого сумма по приходу
				from dbo.o_sklad_pr p
				join dbo.o_sklad_pr_product c on c.o_sklad_pr_id = p.id
			 where p.m_org_id = @m_org_id
			union all
			-- расход
			select c.m_product_id, 
						 isnull(c.kolvo,0) * -1 kolvo,
						 isnull(c.kolvo,0) * -1 *
						 (select max(isnull(p.cost,0))
								from dbo.o_sklad_pr pr
								join dbo.o_sklad_pr_product p on p.o_sklad_pr_id = pr.id
							 where p.m_product_id = c.m_product_id
								 and pr.m_org_id = @m_org_id) cost -- сумму берем из прихода
				from dbo.o_sklad_ras r
				join dbo.o_sklad_ras_product c on c.o_sklad_ras_id = r.id
			 where r.m_org_id = @m_org_id
		) a
		join dbo.m_product p on p.id = a.m_product_id
		group by p.id, p.name) b
	order by b.kolvo desc;
end;

go

exec [dbo].[GET_SKLAD_DATA] @m_org_id = 2