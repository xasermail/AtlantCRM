if exists(select 1 from sys.procedures as a where a.name = 'GET_JURNAL_ITOGI_DATA') drop procedure dbo.GET_JURNAL_ITOGI_DATA;

GO

create procedure [dbo].[GET_JURNAL_ITOGI_DATA]
	@m_org_id int = null,
	@date0 smalldatetime = null,
	@date1 smalldatetime = null
as
begin
	declare @i int = 21,-- счетчик столбцов 
					@j int = 1, -- счетчик обновляемых столбцов
					@k int = 1, -- счетчик строк
					@l int = 0, -- признак выполнения цикла
					@s varchar(max),
					@t varchar(100) = ')';

	if object_id('tempdb..#data') is not null drop table #data;
	if object_id('tempdb..#temp') is not null drop table #temp;

	create table #data (
		id int identity(1,1) not null,
		n1 int, n2 int, n3 int, n4 int, n5 int, n6 int, n7 int, n8 int, n9 int, n10 int,
		n11 int, n12 int, n13 int, n14 int, n15 int, n16 int, n17 int, n18 int,
		n19 int, n20 int, n21plus int
	);

	select o_ank_id,
				 cast(s.d_reg as date) d_reg,
				 isnull(
					 (select max(1) from o_sklad_ras r
							join o_sklad_ras_product p on p.o_sklad_ras_id = r.id
						 where r.o_ank_id = s.o_ank_id 
							 and cast(r.d_schet as date) = cast(s.d_reg as date)
							 and isnull(p.tsena,0) > 0), -- подарки не учитываем
				 0) kup,
				 row_number() over(partition by s.o_ank_id order by s.id asc) rn
		into #temp
		from o_seans s
	 where m_org_id = @m_org_id
		 and cast(s.d_reg as date) between cast(@date0 as date) and cast(@date1 as date)
	order by cast(s.d_reg as date);

	-- две строки в отчете
	insert into #data ( n1 ) select null;
	insert into #data ( n1 ) select null;

	while (@l = 0) begin
		while (@k < 3) begin
			if (@k = 2) begin
				set @t = ' and kup = 1)';
			end;
		
			if (@j < @i) begin
				set @s = 'update #data' +
								 ' set n' + cast(@j as varchar(10)) + ' = (select count(*) from #temp where rn = ' + cast(@j as varchar(10)) + @t +
								 ' where id = ' + cast(@k as varchar(10));
			end else begin
				set @s = 'update #data'+
								 ' set n21plus = (select count(distinct o_ank_id) from #temp where rn > ' + cast(@j as varchar(10)) + @t +
								 ' where id = ' + cast(@k as varchar(10));
			end;
		
			--print(@s);
			exec(@s);
			set @j = @j + 1;

			if (@j > @i) begin
				set @j = 1;
				set @k = @k + 1;
			end;
		end;
		set @l = 1;
	end;

	select * from #data order by id asc;

	if object_id('tempdb..#data') is not null drop table #data;
	if object_id('tempdb..#temp') is not null drop table #temp;
end;