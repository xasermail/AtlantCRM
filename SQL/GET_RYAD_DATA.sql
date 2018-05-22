if exists(select 1 from sys.procedures as a where a.name = 'GET_RYAD_DATA') drop procedure dbo.GET_RYAD_DATA;

GO

create procedure [dbo].[GET_RYAD_DATA]
	@date smalldatetime = null,
	@seans_time_id int = null,
	@m_org_id int = null as
begin
	declare @r1 int = 0, @r2 int = 0, @s varchar(max) = ''; 
	if object_id('tempdb..#r1') is not null drop table #r1;
	if object_id('tempdb..#r2') is not null drop table #r2;
	if object_id('tempdb..#res') is not null drop table #res;

	select cast(row_number() over(order by s.id asc) as int) rn,
				 s.id,
				 s.m_ryad_id,
				 s.seans_state,
				 s.m_seans_time_id,
				 s.o_ank_id,
				 convert(varchar(10),s.d_reg,120) seans_date,
				 isnull(a.name,'') + ' ' +
				 isnull(a.secname,'') + ' ' +
				 cast((
					 select count(*)
						 from o_seans o
						where o.o_ank_id = a.id
							and cast(o.d_reg as date) <= cast(@date as date)
							and o.seans_state = 1
				 ) as varchar(50)) + ' ' +
				 isnull(a.surname,'') fio,
				 (
					 select count(*)
						 from o_seans o
						where o.o_ank_id = a.id
							and cast(o.d_reg as date) <= cast(@date as date)
							and o.seans_state = 1
				 ) visits,
				 case when month(a.birthday)=month(@date) and day(a.birthday)=day(@date) then 1 else 0 end birth,
				 convert(varchar(10),a.date_reg,120) date_reg,
				 isnull((select max(1) from o_dialog d where d.o_ank_id = a.id and d.npos like '%' + convert(varchar(10),@date,104) + '%'),0) dialog
		into #r1
		from o_seans s
		join o_ank a on s.o_ank_id = a.id and isnull(s.m_ryad_id,1) = 1
	 where cast(s.d_reg as date) = cast(isnull(@date, dbo.CREATE_DATE(@m_org_id)) as date)
		 and s.m_seans_time_id = @seans_time_id
		 and s.m_org_id = @m_org_id
		 and s.seans_state = 1; -- регистрация/без регистрации
	 
	select cast(row_number() over(order by s.id asc) as int) rn,
				 s.id,
 				 s.m_ryad_id,
 				 s.seans_state, 
 				 s.m_seans_time_id, 
				 s.o_ank_id,
				 convert(varchar(10),s.d_reg,120) seans_date,
				 isnull(a.name,'') + ' ' +
				 isnull(a.secname,'') + ' ' +
				 cast((
					 select count(*)
						 from o_seans o
						where o.o_ank_id = a.id
							and cast(o.d_reg as date) <= cast(@date as date)
							and o.seans_state = 1
				 ) as varchar(50)) + ' ' +
				 isnull(a.surname,'') fio,
				 (
			 		 select count(*)
						 from o_seans o
						where o.o_ank_id = a.id
							and cast(o.d_reg as date) <= cast(@date as date)
			 				and o.seans_state = 1
				 ) visits,
				 case when month(a.birthday)=month(@date) and day(a.birthday)=day(@date) then 1 else 0 end birth,
				 convert(varchar(10),a.date_reg,120) date_reg,
				 isnull((select max(1) from o_dialog d where d.o_ank_id = a.id and d.npos like '%' + convert(varchar(10),@date,104) + '%'),0) dialog
		into #r2
		from o_seans s
		join o_ank a on s.o_ank_id = a.id and s.m_ryad_id = 2
	 where cast(s.d_reg as date) = cast(isnull(@date, dbo.CREATE_DATE(@m_org_id)) as date)
		 and s.m_seans_time_id = @seans_time_id
		 and s.m_org_id = @m_org_id
		 and s.seans_state = 1; -- регистрация/без регистрации
	 
	 -- 
	set @r1 = (select count(*) from #r1);
	set @r2 = (select count(*) from #r2);
	 
	set @s = '			  a.seans_state seans_state1, 	'+
	 				 '			  a.m_ryad_id m_ryad_id1,	 '+
					 '			  a.m_seans_time_id m_seans_time_id1,	 '+
					 '			  a.o_ank_id o_ank_id1,	 '+
					 '			  a.seans_date seans_date1,	'+
					 '			  a.fio fio1,	 '+
					 '			  a.visits visits1,	 '+
					 '			  a.birth birth1,	 '+
					 '			  a.date_reg date_reg1,	 '+
					 '			  a.dialog dialog1,	 '+
					 '			  a.id id1,	 '+
					 '			  b.seans_state seans_state2,	 '+
					 '			  b.m_ryad_id m_ryad_id2,	 '+
					 '			  b.m_seans_time_id m_seans_time_id2,	 '+
					 '			  b.o_ank_id o_ank_id2,	 '+
					 '			  b.seans_date seans_date2,	 '+
					 '			  b.fio fio2,	 '+
					 '			  b.visits visits2,	 '+
					 '			  b.birth birth2,	 '+
					 '			  b.date_reg date_reg2,	 '+
					 '			  b.dialog dialog2,	 '+
					 '			  b.id id2	 ';
	 
	if (@r1 = @r2) begin
	  set @s = 'select cast(row_number() over(order by a.id) as int) id, ' +
						 @s + 
						 'from #r1 a ' + 
						 'join #r2 b on a.rn = b.rn';
	end;
	 
	if (@r1 > @r2) begin
	  set @s = 'select cast(row_number() over(order by a.id) as int) id, ' +
						 @s + 
						 'from #r1 a ' + 
						 'left join #r2 b on a.rn = b.rn';
	end;
	 
	if (@r1 < @r2) begin
	 set @s = 'select cast(row_number() over(order by b.id) as int) id, ' +
						@s + 
						'from #r1 a ' + 
						'right join #r2 b on a.rn = b.rn';
	end;
	 
	exec(@s);
end;