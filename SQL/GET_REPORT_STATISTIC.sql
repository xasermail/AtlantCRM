-- =============================================
-- Author:		Maynskiy Andrey
-- Create date: 14-01-2017
-- Description:	���������� ��� ������ ����������
-- =============================================
if exists(select 1 from sys.procedures as a where a.name = 'GET_REPORT_STATISTIC') drop procedure dbo.GET_REPORT_STATISTIC;

GO

create procedure dbo.GET_REPORT_STATISTIC
	@fromDate smalldatetime,
	@toDate smalldatetime,
	@m_org_id int
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	/*
declare @fromDate smalldatetime
set @fromDate = cast('2016-01-01' as datetime)

declare @toDate smalldatetime
set @toDate = cast('2017-02-01' as datetime)

declare @m_org_id int
set @m_org_id= 2
--*/

	--����� ���� ������ �������� � �������� ���� ������� �����
	declare @usingFromDate smalldatetime
	set @usingFromDate = cast(@fromDate as date)
	--��� �������� ��������� ���� ����
	declare @usingToDate smalldatetime
	set @usingToDate = dateadd(day,1,cast(@toDate as date))

	--��������� �������, ����� ����� �� ��������� ���� � ���� ������� ����� ���
	declare  @tempData table(O_ANK_ID int, AGE int, SEX_ID int)
	insert @tempData
	select	distinct 
			a.ID,
			DATEDIFF(year,a.BIRTHDAY, getdate()) as AGE,
			a.SEX
	from	O_ANK as a 
			left JOIN O_SEANS as s on a.ID = s.O_ANK_ID
	where	
			@usingFromDate <= a.DATE_REG 
			and a.DATE_REG < @usingToDate
			--@usingFromDate <= s.D_REG 
			--and s.D_REG < @usingToDate
			and a.M_ORG_ID = @m_org_id
	--�������� �������� �������� ������ ������ ���� �����������, � ��������� ������ ��� �����
	
	--����� ��������� ����������� (����� ����, �������� ����� ����������� ����������)
	declare @ALL_COUNT int
	set @ALL_COUNT = (select count(*)
					from	 @tempData)

	--������� �������
	declare @AVG_AGE int
	set @AVG_AGE = isnull((select sum(isnull(AGE, 0)) from @tempData) / @ALL_COUNT, 0)

	--����������� ������� ��� ���������
	declare @MIN_AGE int
	set @MIN_AGE = isnull((select min(isnull(AGE, 0)) from @tempData),0)

	--������������ ������� ��� ���������
	declare @MAX_AGE int
	set @MAX_AGE = isnull((select max(isnull(AGE, 0)) from @tempData),0)

	--�������� ��������������� �������
	declare @POPULAR_AGE int
	set @POPULAR_AGE = isnull((select top 1 t.AGE
						from	@tempData as t
						group by t.AGE
						order by count(t.O_ANK_ID) desc),0)

	--��������� ��������� ������ ��� ����������� �����������
	declare @countMan int
	set @countMan = (select count(*)
					from	@tempData
					where	SEX_ID = (select	top 1 ID
									from	M_SEX
									where	[NAME] = '�������'))

	--����������� ������
	declare @percentMan int
	--��� ���������� ������ ������� �� 0 
	if @ALL_COUNT > 0
	begin
		set @percentMan = cast( (cast(@countMan as float) / cast(@ALL_COUNT as float)) * 100 as int)
	end
	else
	begin
		set @percentMan = 50
	end

	select	@ALL_COUNT as ALL_COUNT	
			, @AVG_AGE as AVG_AGE
			, CAST(@MIN_AGE as varchar(max)) + ' - ' + CAST(@MAX_AGE as varchar(max)) as RANGE_AGE
			, @POPULAR_AGE as POPULAR_AGE
			--��������� ������ � �������� ������� ����������� ��������� ���� �� ���� ���������
			, case when @ALL_COUNT = 0 then '50% / 50%'
			else	--���� ������ ��� �������� ����������� ���������
				cast(@percentMan as varchar(max)) + '% / ' + cast(100 - @percentMan as varchar(max)) + '%' 
			end as RATIO_MAN_AND_WOMAN
			, cast(0 as int) as ZNAUT
			, cast(0 as int) as SALE_BHM
			, cast(0 as int) as SALE_MHM
			, cast(0 as int) as SALE_PROECTOR
			, cast(0 as int) as ALL_COUNT_SALE
END
GO
