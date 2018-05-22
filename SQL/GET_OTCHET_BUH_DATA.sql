/* Расчёт основных бухгалтерских показателей */
if exists(select 1 from sys.procedures as a where a.name = 'GET_OTCHET_BUH_DATA') drop procedure dbo.GET_OTCHET_BUH_DATA;

GO

create procedure [dbo].[GET_OTCHET_BUH_DATA]
	@m_org_id int = null,
	@date0 smalldatetime = null,
	@date1 smalldatetime = null,
  -- если надо получить информацию по сотруднику
  @s_user_id int = 0
as begin

	if object_id('tempdb..#r') is not null drop table #r;

	declare @tovaroob decimal(18,2) = 0,
					@sebest decimal(18,2) = 0,
					@brutto_pr decimal(18,2) = 0,
					@rashod decimal(18,2) = 0,
					@chist_pr decimal(18,2) = 0,
					@rent decimal(18,2) = 0,
					@valov_dohod decimal(18, 2) = 0,
					@tochka_bezub decimal(18, 2) = 0;
				
	select p.o_sklad_ras_id, p.m_product_id,
				 (
				 		select isnull(max(c.cost), 0) cost
							from dbo.o_sklad_pr pr
							join dbo.o_sklad_pr_product c on c.o_sklad_pr_id = pr.id
						 where pr.m_org_id = @m_org_id
							 and c.m_product_id = p.m_product_id
						 group by c.m_product_id
				 ) cost,
				 sum(isnull(o.opl,0)) opl,
				 max(isnull(p.kolvo,0)) kolvo,
				 max(isnull(p.opl_ost,0)) opl_ost
		into #r
		from o_sklad_ras r
		join o_sklad_ras_product p on r.id = p.o_sklad_ras_id
		join o_sklad_ras_product_opl o on o.o_sklad_ras_product_id = p.id
	 where r.m_org_id = @m_org_id
 		 and cast(o.d_opl as date) between cast(@date0 as date) and cast(@date1 as date)
     and (@s_user_id = 0 or r.S_USER_ID = @s_user_id)
	 group by p.o_sklad_ras_id, p.m_product_id;
	 
	-- платежи считаем все
	set @tovaroob = isnull((select sum(opl) from #r ),0);

	-- валовый доход и себестоимость только по полностью проданным товарам
	set @valov_dohod = isnull((select sum(opl) from #r where opl_ost = 0),0);
								  
	set @sebest = isnull((select sum(cost * kolvo) from #r where opl_ost = 0),0);
									  
	set @brutto_pr = isnull(@tovaroob - @sebest,0);

	set @rashod = isnull((select sum(d.summa_rash)
													from dbo.o_ras_dok d
												 where d.m_org_id = @m_org_id
													 and d.m_rashod_stat_id != 17 -- инкассация
													 and cast(d.d_schet as date) between cast(@date0 as date) and cast(@date1 as date)),0);
													 
	set @chist_pr = isnull(@brutto_pr - @rashod,0);

	if (@tovaroob = 0) begin
		set @rent = 0;
	end else begin
		set @rent = isnull((@chist_pr / @tovaroob) * 100,0);
	end;

	set @tochka_bezub = @valov_dohod - @sebest - @rashod;

	select @tovaroob TOVAROOB,
				 @sebest SEBEST,
				 @brutto_pr BRUTTO_PR,
				 @rashod RASHOD,
				 @chist_pr CHIST_PR,
				 @rent RENT,
				 @valov_dohod VALOV_DOHOD,
				 @tochka_bezub TOCHKA_BEZUB;
				 
	if object_id('tempdb..#r') is not null drop table #r;
end;

go

set dateformat dmy;
exec [dbo].[GET_OTCHET_BUH_DATA] @m_org_id = 2, @date0 = '01.01.2017', @date1 = '28.03.2017', @s_user_id = 6;